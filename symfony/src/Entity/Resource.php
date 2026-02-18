<?php

namespace App\Entity;

use App\Repository\ResourceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ResourceRepository::class)]
class Resource
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'resources')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Category $category = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank(message: 'El nombre del recurso es obligatorio.')]
    #[Assert\Length(max: 150)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Positive(message: 'La capacidad debe ser un número positivo.')]
    private int $capacidad = 1;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $ubicacion = null;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    #[Assert\NotNull]
    #[Assert\PositiveOrZero(message: 'El precio no puede ser negativo.')]
    private string $precioHora = '0.00';

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\OneToMany(mappedBy: 'resource', targetEntity: Booking::class)]
    private Collection $bookings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getCategory(): ?Category { return $this->category; }
    public function setCategory(?Category $category): static { $this->category = $category; return $this; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $descripcion): static { $this->descripcion = $descripcion; return $this; }

    public function getCapacidad(): int { return $this->capacidad; }
    public function setCapacidad(int $capacidad): static { $this->capacidad = $capacidad; return $this; }

    public function getUbicacion(): ?string { return $this->ubicacion; }
    public function setUbicacion(?string $ubicacion): static { $this->ubicacion = $ubicacion; return $this; }

    public function getPrecioHora(): string { return $this->precioHora; }
    public function setPrecioHora(string $precioHora): static { $this->precioHora = $precioHora; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getBookings(): Collection { return $this->bookings; }

    public function __toString(): string { return $this->nombre ?? ''; }
}
