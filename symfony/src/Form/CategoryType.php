<?php

namespace App\Form;

use App\Entity\Category;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CategoryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nombre', TextType::class, [
                'label' => 'Nombre',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'Salas de reuniones...'],
            ])
            ->add('descripcion', TextareaType::class, [
                'label'    => 'Descripción',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'rows' => 3],
            ])
            ->add('color', ColorType::class, [
                'label' => 'Color identificativo',
                'attr'  => ['class' => 'form-control form-control-color'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Category::class,
        ]);
    }
}
