<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;

class ProfileFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $userType = $options['user_type'];

        $builder->add('email', EmailType::class, [
            'label' => 'Email *',
            'attr'  => ['class' => 'form-control'],
        ]);

        if ($userType === User::TYPE_PERSONA) {
            $builder
                ->add('nombre', TextType::class, [
                    'label'    => 'Nombre *',
                    'required' => false,
                    'attr'     => ['class' => 'form-control'],
                ])
                ->add('apellidos', TextType::class, [
                    'label'    => 'Apellidos *',
                    'required' => false,
                    'attr'     => ['class' => 'form-control'],
                ])
                ->add('dni', TextType::class, [
                    'label'    => 'DNI *',
                    'required' => false,
                    'attr'     => ['class' => 'form-control', 'placeholder' => '12345678A'],
                ])
                ->add('telefono', TelType::class, [
                    'label'    => 'Teléfono',
                    'required' => false,
                    'attr'     => ['class' => 'form-control', 'placeholder' => '+34 600 000 000'],
                ]);
        }

        if ($userType === User::TYPE_EMPRESA) {
            $builder
                ->add('nombreEmpresa', TextType::class, [
                    'label'    => 'Nombre de la empresa *',
                    'required' => false,
                    'attr'     => ['class' => 'form-control'],
                ])
                ->add('cif', TextType::class, [
                    'label'    => 'CIF *',
                    'required' => false,
                    'attr'     => ['class' => 'form-control', 'placeholder' => 'B12345678'],
                ])
                ->add('sector', TextType::class, [
                    'label'    => 'Sector de actividad',
                    'required' => false,
                    'attr'     => ['class' => 'form-control', 'placeholder' => 'Tecnología, Hostelería…'],
                ])
                ->add('telefonoEmpresa', TelType::class, [
                    'label'    => 'Teléfono de empresa',
                    'required' => false,
                    'attr'     => ['class' => 'form-control', 'placeholder' => '+34 900 000 000'],
                ]);
        }

        $builder->add('plainPassword', RepeatedType::class, [
            'type'     => PasswordType::class,
            'mapped'   => false,
            'required' => false,
            'first_options' => [
                'label' => 'Nueva contraseña',
                'attr'  => ['class' => 'form-control', 'autocomplete' => 'new-password'],
                'constraints' => [
                    new Length([
                        'min'        => 8,
                        'minMessage' => 'La contraseña debe tener al menos {{ limit }} caracteres.',
                    ]),
                ],
            ],
            'second_options' => [
                'label' => 'Confirmar contraseña',
                'attr'  => ['class' => 'form-control'],
            ],
            'invalid_message' => 'Las contraseñas no coinciden.',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'user_type'  => User::TYPE_PERSONA,
            'validation_groups' => ['profile'],
        ]);

        $resolver->setAllowedValues('user_type', [User::TYPE_PERSONA, User::TYPE_EMPRESA]);
    }
}
