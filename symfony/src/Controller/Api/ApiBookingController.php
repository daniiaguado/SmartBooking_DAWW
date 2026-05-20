<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\ResourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/bookings')]
#[IsGranted('ROLE_USER')]
class ApiBookingController extends AbstractController
{
    #[Route('', name: 'api_bookings_index', methods: ['GET'])]
    public function index(BookingRepository $repo, Request $request): JsonResponse
    {
        /** @var User $user */
        $user    = $this->getUser();
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        $estado     = $request->query->get('estado');
        $resourceId = $request->query->getInt('resource') ?: null;
        $desde      = $request->query->get('desde') ? new \DateTime($request->query->get('desde')) : null;
        $hasta      = $request->query->get('hasta') ? new \DateTime($request->query->get('hasta')) : null;

        $isEmpresa = $this->isGranted('ROLE_EMPRESA') || $user->isEmpresa();

        if ($isAdmin) {
            $bookings = $repo->findWithFilters($estado, $desde, $hasta, $resourceId);
        } elseif ($isEmpresa) {
            $nombreEmpresa = $user->getNombreEmpresa() ?? '';
            $bookings = $repo->findByClienteNombre($nombreEmpresa);
        } else {
            $bookings = $repo->findByUserOrdered($user);
        }

        return $this->json(array_map([$this, 'serialize'], $bookings));
    }

    #[Route('/{id}', name: 'api_bookings_show', methods: ['GET'])]
    public function show(Booking $booking): JsonResponse
    {
        $this->denyIfNotOwnerOrAdmin($booking);

        return $this->json($this->serialize($booking));
    }

    #[Route('', name: 'api_bookings_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        BookingRepository $bookingRepo,
        ResourceRepository $resourceRepo
    ): JsonResponse {
        if ($this->isGranted('ROLE_EMPRESA') && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Las empresas no pueden crear reservas directamente.'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $errors = $this->validateBookingData($data);
        if ($errors) {
            return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $resource = $resourceRepo->find($data['resourceId'] ?? 0);
        if (!$resource) {
            return $this->json(['error' => 'Recurso no encontrado'], Response::HTTP_NOT_FOUND);
        }

        try {
            $fechaInicio = new \DateTime($data['fechaInicio']);
            $fechaFin    = new \DateTime($data['fechaFin']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($fechaFin <= $fechaInicio) {
            return $this->json(['error' => 'La fecha de fin debe ser posterior a la de inicio'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $conflicts = $bookingRepo->findConflictingBookings($resource, $fechaInicio, $fechaFin);
        if (!empty($conflicts)) {
            return $this->json(['error' => 'El recurso ya está reservado en ese horario'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking = new Booking();
        $booking->setUser($this->getUser());
        $booking->setResource($resource);
        $booking->setFechaInicio($fechaInicio);
        $booking->setFechaFin($fechaFin);
        $booking->setAsistentes((int) ($data['asistentes'] ?? 1));
        $booking->setMotivo($data['motivo'] ?? null);
        $booking->setClienteNombre($data['clienteNombre'] ?? null);

        if (!$this->isGranted('ROLE_ADMIN')) {
            $booking->setEstado(Booking::ESTADO_PENDIENTE);
        } else {
            $booking->setEstado($data['estado'] ?? Booking::ESTADO_PENDIENTE);
        }

        $em->persist($booking);
        $em->flush();

        return $this->json($this->serialize($booking), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_bookings_update', methods: ['PUT'])]
    public function update(
        Booking $booking,
        Request $request,
        EntityManagerInterface $em,
        BookingRepository $bookingRepo,
        ResourceRepository $resourceRepo
    ): JsonResponse {
        $this->denyIfNotOwnerOrAdmin($booking);

        if ($booking->getEstado() === Booking::ESTADO_CANCELADA && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'No puedes editar una reserva cancelada'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (isset($data['resourceId'])) {
            $resource = $resourceRepo->find($data['resourceId']);
            if (!$resource) {
                return $this->json(['error' => 'Recurso no encontrado'], Response::HTTP_NOT_FOUND);
            }
            $booking->setResource($resource);
        }

        try {
            if (isset($data['fechaInicio'])) {
                $booking->setFechaInicio(new \DateTime($data['fechaInicio']));
            }
            if (isset($data['fechaFin'])) {
                $booking->setFechaFin(new \DateTime($data['fechaFin']));
            }
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->getFechaFin() <= $booking->getFechaInicio()) {
            return $this->json(['error' => 'La fecha de fin debe ser posterior a la de inicio'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $conflicts = $bookingRepo->findConflictingBookings(
            $booking->getResource(),
            $booking->getFechaInicio(),
            $booking->getFechaFin(),
            $booking->getId()
        );
        if (!empty($conflicts)) {
            return $this->json(['error' => 'El recurso ya está reservado en ese horario'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (isset($data['asistentes'])) {
            $booking->setAsistentes((int) $data['asistentes']);
        }
        if (array_key_exists('motivo', $data)) {
            $booking->setMotivo($data['motivo']);
        }
        if (array_key_exists('clienteNombre', $data)) {
            $booking->setClienteNombre($data['clienteNombre']);
        }
        if ($this->isGranted('ROLE_ADMIN') && isset($data['estado'])) {
            $booking->setEstado($data['estado']);
        }

        $em->flush();

        return $this->json($this->serialize($booking));
    }

    #[Route('/{id}', name: 'api_bookings_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Booking $booking, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($booking);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/confirmar', name: 'api_bookings_confirmar', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function confirmar(Booking $booking, EntityManagerInterface $em): JsonResponse
    {
        $booking->setEstado(Booking::ESTADO_CONFIRMADA);
        $em->flush();

        return $this->json($this->serialize($booking));
    }

    #[Route('/{id}/cancelar', name: 'api_bookings_cancelar', methods: ['POST'])]
    public function cancelar(Booking $booking, EntityManagerInterface $em): JsonResponse
    {
        $this->denyIfNotOwnerOrAdmin($booking);

        $booking->setEstado(Booking::ESTADO_CANCELADA);
        $em->flush();

        return $this->json($this->serialize($booking));
    }

    private function denyIfNotOwnerOrAdmin(Booking $booking): void
    {
        if ($this->isGranted('ROLE_ADMIN')) {
            return;
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if ($this->isGranted('ROLE_EMPRESA') || $user->isEmpresa()) {
            $nombreEmpresa = $user->getNombreEmpresa() ?? '';
            if ($booking->getClienteNombre() === $nombreEmpresa) {
                return;
            }
        }

        if ($booking->getUser() === $user) {
            return;
        }

        throw $this->createAccessDeniedException('No tienes permiso para acceder a esta reserva.');
    }

    private function validateBookingData(array $data): array
    {
        $errors = [];
        if (empty($data['resourceId'])) {
            $errors[] = 'El recurso es obligatorio';
        }
        if (empty($data['fechaInicio'])) {
            $errors[] = 'La fecha de inicio es obligatoria';
        }
        if (empty($data['fechaFin'])) {
            $errors[] = 'La fecha de fin es obligatoria';
        }
        return $errors;
    }

    private function serialize(Booking $b): array
    {
        return [
            'id'            => $b->getId(),
            'estado'        => $b->getEstado(),
            'fechaInicio'   => $b->getFechaInicio()?->format(\DateTimeInterface::ATOM),
            'fechaFin'      => $b->getFechaFin()?->format(\DateTimeInterface::ATOM),
            'asistentes'    => $b->getAsistentes(),
            'motivo'        => $b->getMotivo(),
            'clienteNombre' => $b->getClienteNombre(),
            'precioTotal'   => $b->getPrecioTotal(),
            'duracionHoras' => $b->getDuracionHoras(),
            'createdAt'     => $b->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'resource'      => $b->getResource() ? [
                'id'          => $b->getResource()->getId(),
                'nombre'      => $b->getResource()->getNombre(),
                'ubicacion'   => $b->getResource()->getUbicacion(),
                'capacidad'   => $b->getResource()->getCapacidad(),
                'precioHora'  => $b->getResource()->getPrecioHora(),
                'category'    => $b->getResource()->getCategory() ? [
                    'id'     => $b->getResource()->getCategory()->getId(),
                    'nombre' => $b->getResource()->getCategory()->getNombre(),
                    'color'  => $b->getResource()->getCategory()->getColor(),
                ] : null,
            ] : null,
            'user'          => $b->getUser() ? [
                'id'          => $b->getUser()->getId(),
                'displayName' => $b->getUser()->getDisplayName(),
                'email'       => $b->getUser()->getEmail(),
            ] : null,
        ];
    }
}
