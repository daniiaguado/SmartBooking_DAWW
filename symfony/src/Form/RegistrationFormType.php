<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nombre', TextType::class, [
                'label' => 'Nombre',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'Tu nombre'],
            ])
            ->add('apellidos', TextType::class, [
                'label' => 'Apellidos',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'Tus apellidos'],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email',
                'attr'  => ['class' => 'form-control', 'placeholder' => 'tu@email.com'],
            ])
            ->add('telefono', TelType::class, [
                'label'    => 'Teléfono',
                'required' => false,
                'attr'     => ['class' => 'form-control', 'placeholder' => '+34 600 000 000'],
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type'            => PasswordType::class,
                'mapped'          => false,
                'first_options'   => [
                    'label' => 'Contraseña',
                    'attr'  => ['class' => 'form-control', 'autocomplete' => 'new-password'],
                    'constraints' => [
                        new NotBlank(['message' => 'La contraseña es obligatoria.']),
                        new Length(['min' => 8, 'minMessage' => 'Mínimo {{ limit }} caracteres.']),
                    ],
                ],
                'second_options'  => [
                    'label' => 'Repite la contraseña',
                    'attr'  => ['class' => 'form-control'],
                ],
                'invalid_message' => 'Las contraseñas no coinciden.',
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'mapped'      => false,
                'label'       => 'Acepto los términos y condiciones',
                'constraints' => [
                    new IsTrue(['message' => 'Debes aceptar los términos.']),
                ],
                'attr' => ['class' => 'form-check-input'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
