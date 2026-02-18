<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'El nombre de la categoría es obligatorio.')]
    #[Assert\Length(max: 100, maxMessage: 'El nombre no puede superar {{ limit }} caracteres.')]
    private ?string $nombre = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(length: 7)]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/', message: 'El color debe ser un código hexadecimal válido (#RRGGBB).')]
    private string $color = '#0d6efd';

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: Resource::class)]
    private Collection $resources;

    public function __construct()
    {
        $this->resources = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $descripcion): static { $this->descripcion = $descripcion; return $this; }

    public function getColor(): string { return $this->color; }
    public function setColor(string $color): static { $this->color = $color; return $this; }

    public function getResources(): Collection { return $this->resources; }

    public function __toString(): string { return $this->nombre ?? ''; }
}
