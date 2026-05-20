<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

#[Route('/api')]
class ApiAuthController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepo,
        UserPasswordHasherInterface $hasher,
        TokenStorageInterface $tokenStorage
    ): JsonResponse {
        $data     = json_decode($request->getContent(), true) ?? [];
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            return $this->json(['success' => false, 'message' => 'Email y contraseña son obligatorios'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepo->findOneBy(['email' => $email]);

        if (!$user || !$hasher->isPasswordValid($user, $password)) {
            return $this->json(['success' => false, 'message' => 'Email o contraseña incorrectos'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->isActive()) {
            return $this->json(['success' => false, 'message' => 'Cuenta desactivada. Contacta con el administrador.'], Response::HTTP_UNAUTHORIZED);
        }

        $token = new UsernamePasswordToken($user, 'main', $user->getRoles());
        $tokenStorage->setToken($token);
        $request->getSession()->set('_security_main', serialize($token));

        return $this->json(['success' => true, 'user' => $this->serializeUser($user)]);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($this->serializeUser($user));
    }

    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Symfony gestiona el logout vía security.yaml
        return $this->json(['message' => 'Sesión cerrada']);
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserRepository $userRepo,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $userType = $data['userType'] ?? User::TYPE_PERSONA;

        $errors = [];

        // Validar email
        if (empty($email)) {
            $errors['email'] = 'El email es obligatorio.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Introduce un email válido.';
        } elseif ($userRepo->findOneBy(['email' => $email])) {
            $errors['email'] = 'Ya existe una cuenta con este email.';
        }

        // Validar contraseña
        if (empty($password)) {
            $errors['password'] = 'La contraseña es obligatoria.';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
        }

        // Validar tipo
        if (!in_array($userType, [User::TYPE_PERSONA, User::TYPE_EMPRESA])) {
            $errors['userType'] = 'Tipo de cuenta no válido.';
        }

        // Validaciones condicionales por tipo
        if ($userType === User::TYPE_PERSONA) {
            if (empty($data['nombre'])) {
                $errors['nombre'] = 'El nombre es obligatorio.';
            }
            if (empty($data['apellidos'])) {
                $errors['apellidos'] = 'Los apellidos son obligatorios.';
            }
            if (empty($data['dni'])) {
                $errors['dni'] = 'El DNI es obligatorio.';
            } elseif (!preg_match('/^\d{8}[A-Za-z]$/', $data['dni'])) {
                $errors['dni'] = 'El DNI debe tener 8 dígitos seguidos de una letra.';
            }
        } elseif ($userType === User::TYPE_EMPRESA) {
            if (empty($data['nombreEmpresa'])) {
                $errors['nombreEmpresa'] = 'El nombre de empresa es obligatorio.';
            }
            if (empty($data['cif'])) {
                $errors['cif'] = 'El CIF es obligatorio.';
            }
        }

        if (!empty($errors)) {
            return $this->json(['success' => false, 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setUserType($userType);
        $user->setPassword($hasher->hashPassword($user, $password));

        $role = ($userType === User::TYPE_EMPRESA) ? 'ROLE_EMPRESA' : 'ROLE_PERSONA';
        $user->setRoles(['ROLE_USER', $role]);

        if ($userType === User::TYPE_PERSONA) {
            $user->setNombre($data['nombre'] ?? null);
            $user->setApellidos($data['apellidos'] ?? null);
            $user->setDni($data['dni'] ?? null);
            $user->setTelefono($data['telefono'] ?? null);
        } else {
            $user->setNombreEmpresa($data['nombreEmpresa'] ?? null);
            $user->setCif($data['cif'] ?? null);
            $user->setSector($data['sector'] ?? null);
            $user->setTelefonoEmpresa($data['telefonoEmpresa'] ?? null);
        }

        $em->persist($user);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Cuenta creada correctamente'], Response::HTTP_CREATED);
    }

    #[Route('/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepo,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        // Cambio de email (común para todos los tipos)
        if (isset($data['email']) && !empty(trim($data['email']))) {
            $newEmail = trim($data['email']);
            if ($newEmail !== $user->getEmail()) {
                if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                    return $this->json(['error' => 'El email no es válido.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $existing = $userRepo->findOneBy(['email' => $newEmail]);
                if ($existing) {
                    return $this->json(['error' => 'Este email ya está en uso por otra cuenta.'], Response::HTTP_CONFLICT);
                }
                $user->setEmail($newEmail);
            }
        }

        // Cambio de contraseña
        if (!empty($data['currentPassword']) && !empty($data['newPassword'])) {
            if (!$hasher->isPasswordValid($user, $data['currentPassword'])) {
                return $this->json(['error' => 'La contraseña actual no es correcta.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            if (strlen($data['newPassword']) < 8) {
                return $this->json(['error' => 'La nueva contraseña debe tener al menos 8 caracteres.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $user->setPassword($hasher->hashPassword($user, $data['newPassword']));
        }

        if ($user->isEmpresa()) {
            if (isset($data['nombreEmpresa']) && !empty(trim($data['nombreEmpresa']))) {
                $user->setNombreEmpresa(trim($data['nombreEmpresa']));
            }
            if (array_key_exists('cif', $data)) {
                $user->setCif($data['cif'] ?? null);
            }
            if (array_key_exists('sector', $data)) {
                $user->setSector($data['sector'] ?? null);
            }
            if (array_key_exists('telefonoEmpresa', $data)) {
                $user->setTelefonoEmpresa($data['telefonoEmpresa'] ?? null);
            }
        } else {
            if (array_key_exists('nombre', $data)) {
                $user->setNombre($data['nombre'] ?? null);
            }
            if (array_key_exists('apellidos', $data)) {
                $user->setApellidos($data['apellidos'] ?? null);
            }
            if (array_key_exists('dni', $data)) {
                $user->setDni($data['dni'] ?? null);
            }
            if (array_key_exists('telefono', $data)) {
                $user->setTelefono($data['telefono'] ?? null);
            }
        }

        $em->flush();

        return $this->json($this->serializeUser($user));
    }

    #[Route('/check-email', name: 'api_check_email', methods: ['GET'])]
    public function checkEmail(Request $request, UserRepository $userRepo): JsonResponse
    {
        $email = trim($request->query->get('email', ''));

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['available' => false, 'error' => 'Email no válido']);
        }

        $exists = $userRepo->findOneBy(['email' => $email]);

        return $this->json(['available' => !$exists]);
    }

    private function serializeUser($user): array
    {
        return [
            'id'          => $user->getId(),
            'email'       => $user->getEmail(),
            'roles'       => $user->getRoles(),
            'displayName' => $user->getDisplayName(),
            'initials'    => $user->getInitials(),
            'userType'    => $user->getUserType(),
            'isAdmin'     => $user->isAdmin(),
            'isActive'    => $user->isActive(),
            'createdAt'   => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
            'nombre'            => $user->getNombre(),
            'apellidos'         => $user->getApellidos(),
            'dni'               => $user->getDni(),
            'telefono'          => $user->getTelefono(),
            'nombreEmpresa'     => $user->getNombreEmpresa(),
            'cif'               => $user->getCif(),
            'sector'            => $user->getSector(),
            'telefonoEmpresa'   => $user->getTelefonoEmpresa(),
        ];
    }
}
