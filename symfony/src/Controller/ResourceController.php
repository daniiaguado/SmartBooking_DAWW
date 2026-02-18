<?php

namespace App\Controller;

use App\Entity\Resource;
use App\Form\ResourceType;
use App\Repository\CategoryRepository;
use App\Repository\ResourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/resource')]
#[IsGranted('ROLE_USER')]
class ResourceController extends AbstractController
{
    #[Route('', name: 'app_resource_index', methods: ['GET'])]
    public function index(Request $request, ResourceRepository $repo, CategoryRepository $catRepo): Response
    {
        $nombre     = $request->query->get('nombre');
        $categoryId = $request->query->getInt('category') ?: null;
        $capacidad  = $request->query->getInt('capacidad') ?: null;

        $resources   = $repo->findWithFilters($nombre, $categoryId, $capacidad);
        $categories  = $catRepo->findAllOrdered();

        return $this->render('resource/index.html.twig', [
            'resources'  => $resources,
            'categories' => $categories,
            'filtros'    => compact('nombre', 'categoryId', 'capacidad'),
        ]);
    }

    #[Route('/new', name: 'app_resource_new', methods: ['GET', 'POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $resource = new Resource();
        $form     = $this->createForm(ResourceType::class, $resource);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($resource);
            $em->flush();
            $this->addFlash('success', 'Recurso creado correctamente.');
            return $this->redirectToRoute('app_resource_index');
        }

        return $this->render('resource/new.html.twig', ['form' => $form]);
    }

    #[Route('/{id}', name: 'app_resource_show', methods: ['GET'])]
    public function show(Resource $resource): Response
    {
        return $this->render('resource/show.html.twig', ['resource' => $resource]);
    }

    #[Route('/{id}/edit', name: 'app_resource_edit', methods: ['GET', 'POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function edit(Request $request, Resource $resource, EntityManagerInterface $em): Response
    {
        $form = $this->createForm(ResourceType::class, $resource);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();
            $this->addFlash('success', 'Recurso actualizado correctamente.');
            return $this->redirectToRoute('app_resource_index');
        }

        return $this->render('resource/edit.html.twig', ['form' => $form, 'resource' => $resource]);
    }

    #[Route('/{id}/delete', name: 'app_resource_delete', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Request $request, Resource $resource, EntityManagerInterface $em): Response
    {
        if ($this->isCsrfTokenValid('delete' . $resource->getId(), $request->request->get('_token'))) {
            $resource->setIsActive(false);
            $em->flush();
            $this->addFlash('success', 'Recurso desactivado correctamente.');
        }

        return $this->redirectToRoute('app_resource_index');
    }
}
