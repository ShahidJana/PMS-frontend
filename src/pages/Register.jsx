import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(8, 'Minimum 8 chars').required('Password required'),
}).required();

export default function Register() {
  const { register: regFn } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) });
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await regFn(data);
      navigate('/login');
    } catch (e) {
      console.error(e);
      setServerError(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl font-bold mb-6 text-center gradient-text">Create Account</h2>
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
            <input className="form-input" placeholder="Enter your name" {...register('name')} />
            {errors.name && <p className="text-xs text-red-400 mt-2 font-medium tracking-tight">{errors.name?.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <input className="form-input" placeholder="name@company.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-400 mt-2 font-medium tracking-tight">{errors.email?.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="form-input pr-12 transition-all focus:ring-2 focus:ring-indigo-500/20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-2 font-medium tracking-tight">{errors.password?.message}</p>}
          </div>
          <div className="pt-2">
            <button className="btn w-full btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-indigo-500 font-bold hover:text-indigo-600 transition-colors">Login </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
