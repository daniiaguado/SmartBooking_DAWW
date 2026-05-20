<?php

namespace App\Controller\Api;

use App\Entity\Resource;
use App\Repository\CategoryRepository;
use App\Repository\ResourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/resources')]
class ApiResourceController extends AbstractController
{
    #[Route('', name: 'api_resources_index', methods: ['GET'])]
    public function index(ResourceRepository $repo, Request $request): JsonResponse
    {
        $nombre     = $request->query->get('nombre');
        $categoryId = $request->query->getInt('category') ?: null;
        $capacidad  = $request->query->getInt('capacidad') ?: null;

        if ($nombre || $categoryId || $capacidad) {
            $resources = $repo->findWithFilters($nombre, $categoryId, $capacidad);
        } else {
            $resources = $repo->findActive();
        }

        return $this->json(array_map([$this, 'serialize'], $resources));
    }

    #[Route('/{id}', name: 'api_resources_show', methods: ['GET'])]
    public function show(Resource $resource): JsonResponse
    {
        return $this->json($this->serialize($resource));
    }

    #[Route('', name: 'api_resources_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['nombre'])) {
            return $this->json(['error' => 'El nombre del recurso es obligatorio'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $resource = new Resource();
        $this->hydrate($resource, $data, $categoryRepo);

        $em->persist($resource);
        $em->flush();

        return $this->json($this->serialize($resource), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_resources_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(
        Resource $resource,
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON inválido'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->hydrate($resource, $data, $categoryRepo);
        $em->flush();

        return $this->json($this->serialize($resource));
    }

    #[Route('/{id}', name: 'api_resources_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Resource $resource, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($resource);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Resource $resource, array $data, CategoryRepository $categoryRepo): void
    {
        if (isset($data['nombre'])) {
            $resource->setNombre($data['nombre']);
        }
        if (array_key_exists('descripcion', $data)) {
            $resource->setDescripcion($data['descripcion']);
        }
        if (isset($data['capacidad'])) {
            $resource->setCapacidad((int) $data['capacidad']);
        }
        if (array_key_exists('ubicacion', $data)) {
            $resource->setUbicacion($data['ubicacion']);
        }
        if (isset($data['precioHora'])) {
            $resource->setPrecioHora((string) $data['precioHora']);
        }
        if (isset($data['isActive'])) {
            $resource->setIsActive((bool) $data['isActive']);
        }
        if (isset($data['categoryId'])) {
            $cat = $categoryRepo->find($data['categoryId']);
            $resource->setCategory($cat);
        }
    }

    private function serialize(Resource $r): array
    {
        return [
            'id'          => $r->getId(),
            'nombre'      => $r->getNombre(),
            'descripcion' => $r->getDescripcion(),
            'capacidad'   => $r->getCapacidad(),
            'ubicacion'   => $r->getUbicacion(),
            'precioHora'  => $r->getPrecioHora(),
            'isActive'    => $r->isActive(),
            'category'    => $r->getCategory() ? [
                'id'     => $r->getCategory()->getId(),
                'nombre' => $r->getCategory()->getNombre(),
                'color'  => $r->getCategory()->getColor(),
            ] : null,
        ];
    }
}
