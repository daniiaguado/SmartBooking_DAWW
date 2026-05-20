<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class UserController extends AbstractController
{
    #[Route('/users/search-empresas', name: 'app_users_search_empresas', methods: ['GET'])]
    public function searchEmpresas(Request $request, UserRepository $repo): JsonResponse
    {
        $q = trim($request->query->get('q', ''));

        if (strlen($q) < 2) {
            $empresas = $repo->findAllEmpresas();
        } else {
            $empresas = $repo->searchEmpresas($q);
        }

        $data = array_map(fn($u) => [
            'id'            => $u->getId(),
            'nombreEmpresa' => $u->getNombreEmpresa(),
            'cif'           => $u->getCif(),
            'sector'        => $u->getSector(),
        ], $empresas);

        return $this->json($data);
    }

    #[Route('/users/{id}', name: 'app_users_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, UserRepository $repo): JsonResponse
    {
        $user = $repo->find($id);

        if (!$user || $user->getUserType() !== 'empresa') {
            return $this->json(['error' => 'Empresa no encontrada'], 404);
        }

        return $this->json([
            'id'            => $user->getId(),
            'nombreEmpresa' => $user->getNombreEmpresa(),
            'cif'           => $user->getCif(),
            'sector'        => $user->getSector(),
        ]);
    }

    #[Route('/empresas', name: 'app_empresas_index', methods: ['GET'])]
    public function index(UserRepository $repo): Response
    {
        $empresas = $repo->findAllEmpresas();

        return $this->render('user/empresas.html.twig', [
            'empresas' => $empresas,
        ]);
    }
}
