<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Form\BookingType;
use App\Repository\BookingRepository;
use App\Repository\ResourceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/booking')]
#[IsGranted('ROLE_USER')]
class BookingController extends AbstractController
{
    #[Route('', name: 'app_booking_index', methods: ['GET'])]
    public function index(Request $request, BookingRepository $repo): Response
    {
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        $estado     = $request->query->get('estado');
        $resourceId = $request->query->getInt('resource') ?: null;
        $desde      = $request->query->get('desde') ? new \DateTime($request->query->get('desde')) : null;
        $hasta      = $request->query->get('hasta') ? new \DateTime($request->query->get('hasta')) : null;

        if ($isAdmin) {
            $bookings = $repo->findWithFilters($estado, $desde, $hasta, $resourceId);
        } else {
            $bookings = $repo->findByUserOrdered($this->getUser());
        }

        return $this->render('booking/index.html.twig', [
            'bookings'  => $bookings,
            'is_admin'  => $isAdmin,
            'filtros'   => compact('estado', 'desde', 'hasta', 'resourceId'),
        ]);
    }

    #[Route('/new', name: 'app_booking_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em, BookingRepository $repo): Response
    {
        $booking = new Booking();
        $form    = $this->createForm(BookingType::class, $booking, [
            'is_admin' => $this->isGranted('ROLE_ADMIN'),
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($repo->hasConflict(
                $booking->getResource()->getId(),
                $booking->getFechaInicio(),
                $booking->getFechaFin()
            )) {
                $this->addFlash('danger', 'El recurso ya está reservado en ese horario. Elige otro horario o recurso.');
                return $this->render('booking/new.html.twig', ['form' => $form]);
            }

            $booking->setUser($this->getUser());

            if (!$this->isGranted('ROLE_ADMIN')) {
                $booking->setEstado(Booking::ESTADO_PENDIENTE);
            }

            $em->persist($booking);
            $em->flush();

            $this->addFlash('success', 'Reserva creada correctamente.');
            return $this->redirectToRoute('app_booking_index');
        }

        return $this->render('booking/new.html.twig', ['form' => $form]);
    }

    #[Route('/{id}', name: 'app_booking_show', methods: ['GET'])]
    public function show(Booking $booking): Response
    {
        $this->denyAccessIfNotOwnerOrAdmin($booking);

        return $this->render('booking/show.html.twig', ['booking' => $booking]);
    }

    #[Route('/{id}/edit', name: 'app_booking_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Booking $booking, EntityManagerInterface $em, BookingRepository $repo): Response
    {
        $this->denyAccessIfNotOwnerOrAdmin($booking);

        if ($booking->getEstado() === Booking::ESTADO_CANCELADA && !$this->isGranted('ROLE_ADMIN')) {
            $this->addFlash('warning', 'No puedes editar una reserva cancelada.');
            return $this->redirectToRoute('app_booking_index');
        }

        $form = $this->createForm(BookingType::class, $booking, [
            'is_admin' => $this->isGranted('ROLE_ADMIN'),
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($repo->hasConflict(
                $booking->getResource()->getId(),
                $booking->getFechaInicio(),
                $booking->getFechaFin(),
                $booking->getId()
            )) {
                $this->addFlash('danger', 'El recurso ya está reservado en ese horario.');
                return $this->render('booking/edit.html.twig', ['form' => $form, 'booking' => $booking]);
            }

            $em->flush();
            $this->addFlash('success', 'Reserva actualizada correctamente.');
            return $this->redirectToRoute('app_booking_index');
        }

        return $this->render('booking/edit.html.twig', ['form' => $form, 'booking' => $booking]);
    }

    #[Route('/{id}/cancel', name: 'app_booking_cancel', methods: ['POST'])]
    public function cancel(Request $request, Booking $booking, EntityManagerInterface $em): Response
    {
        $this->denyAccessIfNotOwnerOrAdmin($booking);

        if ($this->isCsrfTokenValid('cancel' . $booking->getId(), $request->request->get('_token'))) {
            $booking->setEstado(Booking::ESTADO_CANCELADA);
            $em->flush();
            $this->addFlash('success', 'Reserva cancelada.');
        }

        return $this->redirectToRoute('app_booking_index');
    }

    #[Route('/{id}/delete', name: 'app_booking_delete', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Request $request, Booking $booking, EntityManagerInterface $em): Response
    {
        if ($this->isCsrfTokenValid('delete' . $booking->getId(), $request->request->get('_token'))) {
            $em->remove($booking);
            $em->flush();
            $this->addFlash('success', 'Reserva eliminada.');
        }

        return $this->redirectToRoute('app_booking_index');
    }

    private function denyAccessIfNotOwnerOrAdmin(Booking $booking): void
    {
        if (!$this->isGranted('ROLE_ADMIN') && $booking->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException('No tienes permiso para acceder a esta reserva.');
        }
    }
}
