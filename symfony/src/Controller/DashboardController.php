<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\ResourceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class DashboardController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function home(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_dashboard');
        }

        return $this->render('home/index.html.twig');
    }

    #[Route('/dashboard', name: 'app_dashboard')]
    #[IsGranted('ROLE_USER')]
    public function index(
        BookingRepository  $bookingRepo,
        ResourceRepository $resourceRepo
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $misReservas   = $bookingRepo->findByUserOrdered($user);
        $totalRecursos = count($resourceRepo->findActive());

        // Estadísticas globales (todas las reservas del sistema)
        $estadisticas = $bookingRepo->countByEstado();
        $statsGlobal  = ['pendiente' => 0, 'confirmada' => 0, 'cancelada' => 0];
        foreach ($estadisticas as $row) {
            $statsGlobal[$row['estado']] = (int) $row['total'];
        }

        // Para empresa: stats globales; para persona: stats propias
        if ($user->isEmpresa()) {
            $reservasPendientes   = $statsGlobal['pendiente'];
            $reservasConfirmadas  = $statsGlobal['confirmada'];
            $reservasCanceladas   = $statsGlobal['cancelada'];
            $totalReservas        = $reservasPendientes + $reservasConfirmadas + $reservasCanceladas;
        } else {
            $reservasPendientes  = 0;
            $reservasConfirmadas = 0;
            $reservasCanceladas  = 0;
            foreach ($misReservas as $b) {
                match ($b->getEstado()) {
                    'pendiente'  => $reservasPendientes++,
                    'confirmada' => $reservasConfirmadas++,
                    'cancelada'  => $reservasCanceladas++,
                    default      => null,
                };
            }
            $totalReservas = count($misReservas);
        }

        // Para empresa: todas las reservas del sistema
        $todasReservas = null;
        if ($user->isEmpresa()) {
            $todasReservas = $bookingRepo->findAllWithRelations();
        }

        // Últimas 5 reservas creadas (las más recientes por fecha de inicio DESC)
        $reservasRecientes = $user->isEmpresa()
            ? array_slice($todasReservas ?? [], 0, 5)
            : array_slice($misReservas, 0, 5);

        // Próximas 5 reservas futuras
        $proximasReservas = $user->isEmpresa()
            ? $bookingRepo->findUpcoming(null, 5)
            : $bookingRepo->findUpcoming($user, 5);

        return $this->render('dashboard/index.html.twig', [
            'total_reservas'       => $totalReservas,
            'reservas_confirmadas' => $reservasConfirmadas,
            'reservas_pendientes'  => $reservasPendientes,
            'reservas_canceladas'  => $reservasCanceladas,
            'total_recursos'       => $totalRecursos,
            'proximas_reservas'    => $proximasReservas,
            'reservas_recientes'   => $reservasRecientes,
            // legado — mantener por si otras vistas lo usan
            'mis_reservas'         => $misReservas,
            'stats'                => $statsGlobal,
            'todas_reservas'       => $todasReservas,
        ]);
    }
}
