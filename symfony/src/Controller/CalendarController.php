<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/calendar')]
#[IsGranted('ROLE_USER')]
class CalendarController extends AbstractController
{
    #[Route('', name: 'app_calendar', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('calendar/index.html.twig');
    }

    #[Route('/events', name: 'app_calendar_events', methods: ['GET'])]
    public function events(BookingRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $bookings = ($user->isEmpresa() || $this->isGranted('ROLE_ADMIN'))
            ? $repo->findAllWithRelations()
            : $repo->findByUserOrdered($user);

        $events = array_map(function (Booking $b) {
            $recurso = $b->getResource()?->getNombre() ?? '';
            $usuario = $b->getUser()?->getDisplayName() ?? '';

            return [
                'id'    => $b->getId(),
                'title' => $recurso . ' – ' . $usuario,
                'start' => $b->getFechaInicio()?->format('Y-m-d\TH:i:s'),
                'end'   => $b->getFechaFin()?->format('Y-m-d\TH:i:s'),
                'color' => match ($b->getEstado()) {
                    Booking::ESTADO_CONFIRMADA => '#198754',
                    Booking::ESTADO_CANCELADA  => '#dc3545',
                    default                    => '#fd7e14',
                },
                'url'            => $this->generateUrl('app_booking_show', ['id' => $b->getId()], UrlGeneratorInterface::ABSOLUTE_URL),
                'extendedProps'  => [
                    'estado'  => $b->getEstado(),
                    'recurso' => $recurso,
                    'motivo'  => $b->getMotivo() ?? '',
                ],
            ];
        }, $bookings);

        return new JsonResponse($events);
    }
}
