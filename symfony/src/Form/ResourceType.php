<?php

namespace App\Form;

use App\Entity\Category;
use App\Entity\Resource;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ResourceType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nombre', TextType::class, [
                'label' => 'Nombre del recurso',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'Sala de reuniones A...'],
            ])
            ->add('category', EntityType::class, [
                'class'        => Category::class,
                'choice_label' => 'nombre',
                'label'        => 'Categoría',
                'required'     => false,
                'placeholder'  => 'Sin categoría',
                'attr'         => ['class' => 'form-select'],
            ])
            ->add('descripcion', TextareaType::class, [
                'label'    => 'Descripción',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'rows' => 3],
            ])
            ->add('capacidad', IntegerType::class, [
                'label' => 'Capacidad (personas)',
                'attr'  => ['class' => 'form-control', 'min' => 1],
            ])
            ->add('ubicacion', TextType::class, [
                'label'    => 'Ubicación',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'placeholder' => 'Planta 1, Ala Norte...'],
            ])
            ->add('precioHora', NumberType::class, [
                'label' => 'Precio por hora (€)',
                'scale' => 2,
                'html5' => true,
                'attr'  => ['class' => 'form-control', 'min' => '0', 'step' => '0.01', 'placeholder' => '0.00'],
            ])
            ->add('isActive', CheckboxType::class, [
                'label'    => 'Recurso activo',
                'required' => false,
                'attr'     => ['class' => 'form-check-input'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Resource::class,
        ]);
    }
}
