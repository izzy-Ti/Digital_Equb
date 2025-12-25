import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent } from '../components/ui/Card';
import { validateForm } from '../utils/validators';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { register, googleLogin, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData, {
      firstName: { required: true },
      lastName: { required: true },
      email: { required: true, email: true },
      phoneNumber: { required: true },
      password: { required: true, password: true },
    });

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      navigate('/verify-email'); // Or login, depending on flow
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-slate-400">Join the future of rotating savings</p>
        </div>

        <Card className="border-t border-secondary-500/20">
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <Input
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      error={errors.firstName}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <Input
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      error={errors.lastName}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    error={errors.email}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10"
                    error={errors.phoneNumber}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    error={errors.password}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        try {
                            const data = await googleLogin(credentialResponse.credential);
                            if (!data.user.isWalletLinked) {
                                navigate('/dashboard');
                            } else {
                                navigate('/dashboard');
                            }
                        } catch (err) {
                            console.error("Google Login Error", err);
                        }
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                    theme="filled_black"
                    shape="pill"
                />
            </div>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary-400 hover:text-secondary-300 font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
