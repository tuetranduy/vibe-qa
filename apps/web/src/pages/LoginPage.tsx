import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    // @ts-expect-error - zodResolver type mismatch with zod v3
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        if (statusCode === 401) {
          setError('Invalid email or password. Please try again.');
        } else {
          const errorMessage = err.response.data?.error?.message || 'Login failed';
          setError(errorMessage);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.email && <span style={{ color: 'red', fontSize: '14px' }}>{errors.email.message}</span>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.password && <span style={{ color: 'red', fontSize: '14px' }}>{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
