import { Building2, Shield, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: 'Building Management',
      description: 'Efficiently manage multiple buildings and units in one place',
    },
    {
      icon: TrendingUp,
      title: 'Cost Tracking',
      description: 'Track expenses, generate bills, and monitor financial health',
    },
    {
      icon: Users,
      title: 'Resident Portal',
      description: 'Residents can view bills, make payments, and stay informed',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control for admins, managers, and residents',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 border-b">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Property Management Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Simplify Building
              <span className="text-primary"> Cost Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solution for managing buildings, units, costs, and residents. 
              Track expenses, generate bills, and keep everyone informed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for property managers, building administrators, and residents
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-lg opacity-90">
              Join hundreds of property managers who trust BuildingHub for their daily operations
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="gap-2">
              Start Managing Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 BuildingHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
