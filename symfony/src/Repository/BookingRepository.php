<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function findByUserOrdered(User $user): array
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r')
            ->where('b.user = :user')
            ->setParameter('user', $user)
            ->orderBy('b.fechaInicio', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findAllWithRelations(): array
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.user', 'u')
            ->addSelect('u')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r')
            ->orderBy('b.fechaInicio', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findWithFilters(?string $estado, ?\DateTimeInterface $desde, ?\DateTimeInterface $hasta, ?int $resourceId): array
    {
        $qb = $this->createQueryBuilder('b')
            ->leftJoin('b.user', 'u')
            ->addSelect('u')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r');

        if ($estado) {
            $qb->andWhere('b.estado = :estado')->setParameter('estado', $estado);
        }
        if ($desde) {
            $qb->andWhere('b.fechaInicio >= :desde')->setParameter('desde', $desde);
        }
        if ($hasta) {
            $qb->andWhere('b.fechaFin <= :hasta')->setParameter('hasta', $hasta);
        }
        if ($resourceId) {
            $qb->andWhere('b.resource = :rid')->setParameter('rid', $resourceId);
        }

        return $qb->orderBy('b.fechaInicio', 'DESC')->getQuery()->getResult();
    }

    public function countByEstado(): array
    {
        return $this->createQueryBuilder('b')
            ->select('b.estado, COUNT(b.id) as total')
            ->groupBy('b.estado')
            ->getQuery()
            ->getResult();
    }

    public function hasConflict(int $resourceId, \DateTimeInterface $inicio, \DateTimeInterface $fin, ?int $excludeId = null): bool
    {
        $qb = $this->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->where('b.resource = :rid')
            ->andWhere('b.estado != :cancelada')
            ->andWhere('b.fechaInicio < :fin')
            ->andWhere('b.fechaFin > :inicio')
            ->setParameter('rid', $resourceId)
            ->setParameter('cancelada', Booking::ESTADO_CANCELADA)
            ->setParameter('fin', $fin)
            ->setParameter('inicio', $inicio);

        if ($excludeId) {
            $qb->andWhere('b.id != :excludeId')->setParameter('excludeId', $excludeId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    /**
     * Devuelve las reservas que se solapan con el tramo [start, end] para el recurso dado.
     * Solo considera reservas pendientes o confirmadas (no canceladas).
     * Opcionalmente excluye una reserva por ID (útil al editar).
     */
    /**
     * Reservas futuras (fechaInicio >= ahora) ordenadas por fecha ascendente.
     * Si $user es null devuelve las de todos los usuarios.
     */
    public function findUpcoming(?User $user = null, int $limit = 5): array
    {
        $qb = $this->createQueryBuilder('b')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r')
            ->leftJoin('b.user', 'u')
            ->addSelect('u')
            ->where('b.fechaInicio >= :now')
            ->setParameter('now', new \DateTime())
            ->orderBy('b.fechaInicio', 'ASC')
            ->setMaxResults($limit);

        if ($user !== null) {
            $qb->andWhere('b.user = :user')->setParameter('user', $user);
        }

        return $qb->getQuery()->getResult();
    }

    public function findByClienteNombre(string $nombre, int $limit = 0): array
    {
        $qb = $this->createQueryBuilder('b')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r')
            ->leftJoin('b.user', 'u')
            ->addSelect('u')
            ->where('b.clienteNombre = :nombre')
            ->setParameter('nombre', $nombre)
            ->orderBy('b.fechaInicio', 'DESC');

        if ($limit > 0) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function countByEstadoForClienteNombre(string $nombre): array
    {
        return $this->createQueryBuilder('b')
            ->select('b.estado, COUNT(b.id) as total')
            ->where('b.clienteNombre = :nombre')
            ->setParameter('nombre', $nombre)
            ->groupBy('b.estado')
            ->getQuery()
            ->getResult();
    }

    public function findUpcomingByClienteNombre(string $nombre, int $limit = 5): array
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.resource', 'r')
            ->addSelect('r')
            ->leftJoin('b.user', 'u')
            ->addSelect('u')
            ->where('b.clienteNombre = :nombre')
            ->andWhere('b.fechaInicio >= :now')
            ->setParameter('nombre', $nombre)
            ->setParameter('now', new \DateTime())
            ->orderBy('b.fechaInicio', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findConflictingBookings(
        \App\Entity\Resource $resource,
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        ?int $excludeBookingId = null
    ): array {
        $qb = $this->createQueryBuilder('b')
            ->where('b.resource = :resource')
            ->andWhere('b.estado IN (:estados)')
            ->andWhere('b.fechaInicio < :end')
            ->andWhere('b.fechaFin > :start')
            ->setParameter('resource', $resource)
            ->setParameter('estados', [Booking::ESTADO_PENDIENTE, Booking::ESTADO_CONFIRMADA])
            ->setParameter('start', $start)
            ->setParameter('end', $end);

        if ($excludeBookingId !== null) {
            $qb->andWhere('b.id != :excludeId')
               ->setParameter('excludeId', $excludeBookingId);
        }

        return $qb->orderBy('b.fechaInicio', 'ASC')
                  ->getQuery()
                  ->getResult();
    }
}
