<?php

namespace App\Controller\Api;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/categories')]
class ApiCategoryController extends AbstractController
{
    #[Route('', name: 'api_categories_index', methods: ['GET'])]
    public function index(CategoryRepository $repo): JsonResponse
    {
        $categories = $repo->findBy([], ['nombre' => 'ASC']);

        return $this->json(array_map([$this, 'serialize'], $categories));
    }

    #[Route('/{id}', name: 'api_categories_show', methods: ['GET'])]
    public function show(Category $category): JsonResponse
    {
        return $this->json($this->serialize($category));
    }

    #[Route('', name: 'api_categories_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['nombre'])) {
            return $this->json(['error' => 'El nombre de la categoría es obligatorio'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $category = new Category();
        $this->hydrate($category, $data);

        $em->persist($category);
        $em->flush();

        return $this->json($this->serialize($category), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_categories_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(Category $category, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->hydrate($category, $data);
        $em->flush();

        return $this->json($this->serialize($category));
    }

    #[Route('/{id}', name: 'api_categories_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Category $category, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($category);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Category $category, array $data): void
    {
        if (isset($data['nombre'])) {
            $category->setNombre($data['nombre']);
        }
        if (array_key_exists('descripcion', $data)) {
            $category->setDescripcion($data['descripcion']);
        }
        if (isset($data['color'])) {
            $category->setColor($data['color']);
        }
    }

    private function serialize(Category $c): array
    {
        return [
            'id'          => $c->getId(),
            'nombre'      => $c->getNombre(),
            'descripcion' => $c->getDescripcion(),
            'color'       => $c->getColor(),
            'totalRecursos' => $c->getResources()->count(),
        ];
    }
}
