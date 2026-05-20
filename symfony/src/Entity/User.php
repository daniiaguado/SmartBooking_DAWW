<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(fields: ['email'], message: 'Ya existe una cuenta con este email.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const TYPE_PERSONA  = 'persona';
    public const TYPE_EMPRESA  = 'empresa';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank(message: 'El email es obligatorio.')]
    #[Assert\Email(message: 'Introduce un email válido.')]
    private ?string $email = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[Assert\NotBlank(groups: ['registration'], message: 'La contraseña es obligatoria.')]
    #[Assert\Length(min: 8, minMessage: 'La contraseña debe tener al menos 8 caracteres.')]
    private ?string $plainPassword = null;

    /** 'persona' | 'empresa' */
    #[ORM\Column(length: 10)]
    private string $userType = self::TYPE_PERSONA;

    // ── Campos de Persona ────────────────────────────────────────────────────

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $nombre = null;

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $apellidos = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $dni = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telefono = null;

    // ── Campos de Empresa ────────────────────────────────────────────────────

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $nombreEmpresa = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $cif = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $sector = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telefonoEmpresa = null;

    // ── Campos comunes ───────────────────────────────────────────────────────

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Booking::class, orphanRemoval: true)]
    private Collection $bookings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTime();
    }

    /**
     * Validación condicional según tipo de usuario.
     */
    #[Assert\Callback]
    public function validateByType(ExecutionContextInterface $context): void
    {
        if ($this->userType === self::TYPE_PERSONA) {
            if (empty($this->nombre)) {
                $context->buildViolation('El nombre es obligatorio.')
                    ->atPath('nombre')->addViolation();
            }
            if (empty($this->apellidos)) {
                $context->buildViolation('Los apellidos son obligatorios.')
                    ->atPath('apellidos')->addViolation();
            }
            if (empty($this->dni)) {
                $context->buildViolation('El DNI es obligatorio.')
                    ->atPath('dni')->addViolation();
            }
        } elseif ($this->userType === self::TYPE_EMPRESA) {
            if (empty($this->nombreEmpresa)) {
                $context->buildViolation('El nombre de empresa es obligatorio.')
                    ->atPath('nombreEmpresa')->addViolation();
            }
            if (empty($this->cif)) {
                $context->buildViolation('El CIF es obligatorio.')
                    ->atPath('cif')->addViolation();
            }
        }
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        $roles   = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }

    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function getPlainPassword(): ?string { return $this->plainPassword; }
    public function setPlainPassword(?string $plainPassword): static { $this->plainPassword = $plainPassword; return $this; }

    public function eraseCredentials(): void { $this->plainPassword = null; }

    public function getUserType(): string { return $this->userType; }
    public function setUserType(string $userType): static { $this->userType = $userType; return $this; }

    public function isPersona(): bool { return $this->userType === self::TYPE_PERSONA; }
    public function isEmpresa(): bool { return $this->userType === self::TYPE_EMPRESA; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(?string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getApellidos(): ?string { return $this->apellidos; }
    public function setApellidos(?string $apellidos): static { $this->apellidos = $apellidos; return $this; }

    public function getDni(): ?string { return $this->dni; }
    public function setDni(?string $dni): static { $this->dni = $dni; return $this; }

    public function getTelefono(): ?string { return $this->telefono; }
    public function setTelefono(?string $telefono): static { $this->telefono = $telefono; return $this; }

    public function getNombreEmpresa(): ?string { return $this->nombreEmpresa; }
    public function setNombreEmpresa(?string $nombreEmpresa): static { $this->nombreEmpresa = $nombreEmpresa; return $this; }

    public function getCif(): ?string { return $this->cif; }
    public function setCif(?string $cif): static { $this->cif = $cif; return $this; }

    public function getSector(): ?string { return $this->sector; }
    public function setSector(?string $sector): static { $this->sector = $sector; return $this; }

    public function getTelefonoEmpresa(): ?string { return $this->telefonoEmpresa; }
    public function setTelefonoEmpresa(?string $telefonoEmpresa): static { $this->telefonoEmpresa = $telefonoEmpresa; return $this; }

    /** Nombre para mostrar (persona: nombre completo; empresa: nombre empresa) */
    public function getDisplayName(): string
    {
        if ($this->userType === self::TYPE_EMPRESA) {
            return $this->nombreEmpresa ?? $this->email ?? '';
        }
        return trim(($this->nombre ?? '') . ' ' . ($this->apellidos ?? '')) ?: ($this->email ?? '');
    }

    /** Iniciales para el avatar */
    public function getInitials(): string
    {
        if ($this->userType === self::TYPE_EMPRESA) {
            return mb_strtoupper(mb_substr($this->nombreEmpresa ?? 'E', 0, 2));
        }
        $n = mb_substr($this->nombre   ?? '', 0, 1);
        $a = mb_substr($this->apellidos ?? '', 0, 1);
        return mb_strtoupper($n . $a) ?: 'U';
    }

    /** Compatibilidad: getNombreCompleto() devuelve getDisplayName() */
    public function getNombreCompleto(): string { return $this->getDisplayName(); }

    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function setCreatedAt(\DateTimeInterface $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getBookings(): Collection { return $this->bookings; }

    public function isAdmin(): bool { return in_array('ROLE_ADMIN', $this->getRoles()); }
}
