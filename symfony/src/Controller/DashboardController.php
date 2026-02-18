<?php

namespace App\Controller;

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
        $user = $this->getUser();

        $misReservas   = $bookingRepo->findByUserOrdered($user);
        $estadisticas  = $bookingRepo->countByEstado();
        $totalRecursos = count($resourceRepo->findActive());

        $stats = ['pendiente' => 0, 'confirmada' => 0, 'cancelada' => 0];
        foreach ($estadisticas as $row) {
            $stats[$row['estado']] = $row['total'];
        }

        return $this->render('dashboard/index.html.twig', [
            'mis_reservas'   => $misReservas,
            'stats'          => $stats,
            'total_recursos' => $totalRecursos,
        ]);
    }
}
