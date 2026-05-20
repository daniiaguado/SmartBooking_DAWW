<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\ResourceRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
#[IsGranted('ROLE_USER')]
class ApiDashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'api_dashboard', methods: ['GET'])]
    public function index(
        BookingRepository  $bookingRepo,
        ResourceRepository $resourceRepo,
        UserRepository     $userRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // ── ROLE_ADMIN ────────────────────────────────────────────────────────
        if ($user->isAdmin()) {
            $totalRecursos = count($resourceRepo->findActive());
            $totalUsuarios = count($userRepo->findAll());

            $statsGlobal = ['pendiente' => 0, 'confirmada' => 0, 'cancelada' => 0];
            foreach ($bookingRepo->countByEstado() as $row) {
                $statsGlobal[$row['estado']] = (int) $row['total'];
            }
            $total = $statsGlobal['pendiente'] + $statsGlobal['confirmada'] + $statsGlobal['cancelada'];

            $proximasReservas = $bookingRepo->findUpcoming(null, 5);

            return $this->json([
                'totalReservas'       => $total,
                'reservasConfirmadas' => $statsGlobal['confirmada'],
                'reservasPendientes'  => $statsGlobal['pendiente'],
                'reservasCanceladas'  => $statsGlobal['cancelada'],
                'totalRecursos'       => $totalRecursos,
                'totalUsuarios'       => $totalUsuarios,
                'proximasReservas'    => array_map(fn($b) => $this->serializeBooking($b), $proximasReservas),
            ]);
        }

        // ── ROLE_EMPRESA ──────────────────────────────────────────────────────
        if ($user->isEmpresa()) {
            $nombreEmpresa = $user->getNombreEmpresa() ?? '';

            $stats = ['pendiente' => 0, 'confirmada' => 0, 'cancelada' => 0];
            foreach ($bookingRepo->countByEstadoForClienteNombre($nombreEmpresa) as $row) {
                $stats[$row['estado']] = (int) $row['total'];
            }
            $total = $stats['pendiente'] + $stats['confirmada'] + $stats['cancelada'];

            $ultimasReservas = $bookingRepo->findByClienteNombre($nombreEmpresa, 5);

            return $this->json([
                'totalReservas'            => $total,
                'reservasConfirmadas'      => $stats['confirmada'],
                'reservasPendientes'       => $stats['pendiente'],
                'reservasCanceladas'       => $stats['cancelada'],
                'totalRecursos'            => 0,
                'proximasReservas'         => [],
                'nombreEmpresa'            => $user->getNombreEmpresa(),
                'cif'                      => $user->getCif(),
                'sector'                   => $user->getSector(),
                'telefonoEmpresa'          => $user->getTelefonoEmpresa(),
                'ultimasReservasRecibidas' => array_map(fn($b) => $this->serializeBooking($b), $ultimasReservas),
            ]);
        }

        // ── ROLE_PERSONA ──────────────────────────────────────────────────────
        $misReservas = $bookingRepo->findByUserOrdered($user);
        $pendientes  = 0;
        $confirmadas = 0;
        $canceladas  = 0;
        foreach ($misReservas as $b) {
            match ($b->getEstado()) {
                'pendiente'  => $pendientes++,
                'confirmada' => $confirmadas++,
                'cancelada'  => $canceladas++,
                default      => null,
            };
        }

        $proximasReservas = $bookingRepo->findUpcoming($user, 5);

        return $this->json([
            'totalReservas'       => count($misReservas),
            'reservasConfirmadas' => $confirmadas,
            'reservasPendientes'  => $pendientes,
            'reservasCanceladas'  => $canceladas,
            'totalRecursos'       => 0,
            'proximasReservas'    => array_map(fn($b) => $this->serializeBooking($b), $proximasReservas),
        ]);
    }

    private function serializeBooking(\App\Entity\Booking $b): array
    {
        return [
            'id'            => $b->getId(),
            'estado'        => $b->getEstado(),
            'fechaInicio'   => $b->getFechaInicio()?->format('Y-m-d H:i:s'),
            'fechaFin'      => $b->getFechaFin()?->format('Y-m-d H:i:s'),
            'asistentes'    => $b->getAsistentes(),
            'motivo'        => $b->getMotivo(),
            'clienteNombre' => $b->getClienteNombre(),
            'precioTotal'   => $b->getPrecioTotal(),
            'duracionHoras' => $b->getDuracionHoras(),
            'resource'      => $b->getResource() ? [
                'id'       => $b->getResource()->getId(),
                'nombre'   => $b->getResource()->getNombre(),
                'ubicacion'=> $b->getResource()->getUbicacion(),
            ] : null,
            'user'          => $b->getUser() ? [
                'id'          => $b->getUser()->getId(),
                'displayName' => $b->getUser()->getDisplayName(),
                'email'       => $b->getUser()->getEmail(),
            ] : null,
        ];
    }
}
