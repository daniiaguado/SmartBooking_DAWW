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
}
