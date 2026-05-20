<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Booking
{
    public const ESTADO_PENDIENTE   = 'pendiente';
    public const ESTADO_CONFIRMADA  = 'confirmada';
    public const ESTADO_CANCELADA   = 'cancelada';

    public const ESTADOS = [
        'Pendiente'  => self::ESTADO_PENDIENTE,
        'Confirmada' => self::ESTADO_CONFIRMADA,
        'Cancelada'  => self::ESTADO_CANCELADA,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Resource::class, inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Debes seleccionar un recurso.')]
    private ?Resource $resource = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull(message: 'La fecha de inicio es obligatoria.')]
    private ?\DateTimeInterface $fechaInicio = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull(message: 'La fecha de fin es obligatoria.')]
    #[Assert\GreaterThan(propertyPath: 'fechaInicio', message: 'La fecha de fin debe ser posterior a la de inicio.')]
    private ?\DateTimeInterface $fechaFin = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\Positive(message: 'El número de asistentes debe ser positivo.')]
    private int $asistentes = 1;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $motivo = null;

    #[ORM\Column(length: 200, nullable: true)]
    private ?string $clienteNombre = null;

    #[ORM\Column(length: 20)]
    private string $estado = self::ESTADO_PENDIENTE;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $precioTotal = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTime();
        $this->calcularPrecio();
    }

    #[ORM\PreUpdate]
    public function onUpdate(): void
    {
        $this->calcularPrecio();
    }

    private function calcularPrecio(): void
    {
        if ($this->fechaInicio && $this->fechaFin && $this->resource) {
            $horas = ($this->fechaFin->getTimestamp() - $this->fechaInicio->getTimestamp()) / 3600;
            $this->precioTotal = number_format(
                $horas * (float) $this->resource->getPrecioHora(),
                2, '.', ''
            );
        }
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getResource(): ?Resource { return $this->resource; }
    public function setResource(?Resource $resource): static { $this->resource = $resource; return $this; }

    public function getFechaInicio(): ?\DateTimeInterface { return $this->fechaInicio; }
    public function setFechaInicio(?\DateTimeInterface $fechaInicio): static { $this->fechaInicio = $fechaInicio; return $this; }

    public function getFechaFin(): ?\DateTimeInterface { return $this->fechaFin; }
    public function setFechaFin(?\DateTimeInterface $fechaFin): static { $this->fechaFin = $fechaFin; return $this; }

    public function getAsistentes(): int { return $this->asistentes; }
    public function setAsistentes(int $asistentes): static { $this->asistentes = $asistentes; return $this; }

    public function getMotivo(): ?string { return $this->motivo; }
    public function setMotivo(?string $motivo): static { $this->motivo = $motivo; return $this; }

    public function getClienteNombre(): ?string { return $this->clienteNombre; }
    public function setClienteNombre(?string $clienteNombre): static { $this->clienteNombre = $clienteNombre; return $this; }

    public function getEstado(): string { return $this->estado; }
    public function setEstado(string $estado): static { $this->estado = $estado; return $this; }

    public function getPrecioTotal(): ?string { return $this->precioTotal; }
    public function setPrecioTotal(?string $precioTotal): static { $this->precioTotal = $precioTotal; return $this; }

    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }

    public function getDuracionHoras(): float
    {
        if (!$this->fechaInicio || !$this->fechaFin) return 0;
        return round(($this->fechaFin->getTimestamp() - $this->fechaInicio->getTimestamp()) / 3600, 2);
    }
}
