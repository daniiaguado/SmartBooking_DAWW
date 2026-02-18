<?php

namespace App\Repository;

use App\Entity\Resource;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ResourceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Resource::class);
    }

    public function findActive(): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.category', 'c')
            ->addSelect('c')
            ->where('r.isActive = true')
            ->orderBy('r.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByCategory(int $categoryId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.category = :cat')
            ->andWhere('r.isActive = true')
            ->setParameter('cat', $categoryId)
            ->orderBy('r.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findWithFilters(?string $nombre, ?int $categoryId, ?int $capacidad): array
    {
        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.category', 'c')
            ->addSelect('c')
            ->where('r.isActive = true');

        if ($nombre) {
            $qb->andWhere('r.nombre LIKE :nombre')
               ->setParameter('nombre', '%' . $nombre . '%');
        }
        if ($categoryId) {
            $qb->andWhere('r.category = :cat')
               ->setParameter('cat', $categoryId);
        }
        if ($capacidad) {
            $qb->andWhere('r.capacidad >= :cap')
               ->setParameter('cap', $capacidad);
        }

        return $qb->orderBy('r.nombre', 'ASC')->getQuery()->getResult();
    }
}
