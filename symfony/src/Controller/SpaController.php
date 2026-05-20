<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Catch-all controller para la Angular SPA.
 * Todas las rutas bajo /app/* se sirven por aquí y Angular Router
 * se encarga de la navegación interna.
 * El control de acceso lo gestiona security.yaml (access_control).
 */
class SpaController extends AbstractController
{
    #[Route('/app', name: 'app_spa')]
    #[Route('/app/{path}', name: 'app_spa_path', requirements: ['path' => '.+'])]
    public function index(): Response
    {
        return $this->render('spa.html.twig');
    }
}
