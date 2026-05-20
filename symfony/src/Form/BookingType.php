<?php

namespace App\Form;

use App\Entity\Booking;
use App\Entity\Resource;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class BookingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $isAdmin   = $options['is_admin'];
        $empresaId = $options['empresa_id'];

        $builder
            ->add('empresaId', HiddenType::class, [
                'mapped'   => false,
                'required' => false,
                'data'     => $empresaId,
            ])
            ->add('resource', EntityType::class, [
                'class'        => Resource::class,
                'choice_label' => fn(Resource $r) => sprintf('%s (Cap. %d – %.2f€/h)', $r->getNombre(), $r->getCapacidad(), $r->getPrecioHora()),
                'label'        => 'Recurso',
                'placeholder'  => 'Selecciona un recurso...',
                'query_builder' => fn($repo) => $repo->createQueryBuilder('r')
                    ->leftJoin('r.category', 'c')
                    ->addSelect('c')
                    ->where('r.isActive = true')
                    ->orderBy('r.nombre', 'ASC'),
                'attr' => ['class' => 'form-select'],
            ])
            ->add('fechaInicio', DateTimeType::class, [
                'label'        => 'Fecha y hora de inicio',
                'widget'       => 'single_text',
                'html5'        => true,
                'attr'         => ['class' => 'form-control'],
            ])
            ->add('fechaFin', DateTimeType::class, [
                'label'  => 'Fecha y hora de fin',
                'widget' => 'single_text',
                'html5'  => true,
                'attr'   => ['class' => 'form-control'],
            ])
            ->add('asistentes', IntegerType::class, [
                'label' => 'Número de asistentes',
                'attr'  => ['class' => 'form-control', 'min' => 1],
            ])
            ->add('motivo', TextareaType::class, [
                'label'    => 'Motivo / Descripción',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'rows' => 3, 'placeholder' => 'Describe el propósito de la reserva...'],
            ])
        ;

        if ($isAdmin) {
            $builder->add('estado', ChoiceType::class, [
                'label'   => 'Estado',
                'choices' => Booking::ESTADOS,
                'attr'    => ['class' => 'form-select'],
            ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Booking::class,
            'is_admin'   => false,
            'empresa_id' => null,
        ]);
    }
}
