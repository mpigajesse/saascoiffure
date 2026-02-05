import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, TrendingUp, Search, Filter, Receipt, Wallet, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'ONLINE' | 'AIRTEL_MONEY' | 'CASH_ON_ARRIVAL';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
  CASH: { label: 'Espèces', icon: <Banknote className="w-4 h-4" /> },
  CARD: { label: 'Carte', icon: <CreditCard className="w-4 h-4" /> },
  MOBILE: { label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  ONLINE: { label: 'En ligne', icon: <Wallet className="w-4 h-4" /> },
  AIRTEL_MONEY: { label: 'Airtel Money', icon: <Smartphone className="w-4 h-4" /> },
  CASH_ON_ARRIVAL: { label: 'À l\'arrivée', icon: <CreditCard className="w-4 h-4" /> },
};

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-secondary text-secondary-foreground' },
  COMPLETED: { label: 'Complété', className: 'bg-primary/10 text-primary' },
  REFUNDED: { label: 'Remboursé', className: 'bg-destructive/10 text-destructive' },
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  // TODO: Utiliser les vrais hooks React Query pour les paiements
  const payments: any[] = [];
  const totalRevenue = 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-left">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            Caisse & Paiements
          </h1>
          <p className="text-muted-foreground mt-1">Suivi des encaissements et revenus</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Aujourd'hui", value: 0, icon: Banknote, delay: 0 },
            { label: "Cette semaine", value: 0, icon: TrendingUp, delay: 50 },
            { label: "Ce mois", value: 0, icon: Banknote, delay: 100 },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value} FCFA</p>
                </div>
              </div>
            </div>
          ))}
          
          <div 
            className="gradient-sunset text-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-80">Total filtré</p>
                <p className="text-2xl font-bold">{totalRevenue} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Module Paiements</AlertTitle>
          <AlertDescription>
            Les paiements seront enregistrés automatiquement lors des rendez-vous. 
            Actuellement, aucun paiement n'est enregistré dans la base de données.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedMethod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMethod('all')}
              className="transition-all duration-200 hover:scale-105"
            >
              <Filter className="w-4 h-4 mr-2" />
              Tous
            </Button>
            {Object.entries(methodConfig).map(([method, config]) => (
              <Button 
                key={method}
                variant={selectedMethod === method ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMethod(method)}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                {config.icon}
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Payments table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 font-medium text-sm uppercase tracking-wide">Date</th>
                  <th className="text-left p-4 font-medium text-sm uppercase tracking-wide">Client</th>
                  <th className="text-left p-4 font-medium text-sm uppercase tracking-wide">Méthode</th>
                  <th className="text-left p-4 font-medium text-sm uppercase tracking-wide">Statut</th>
                  <th className="text-right p-4 font-medium text-sm uppercase tracking-wide">Montant</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucun paiement</p>
                      <p className="text-sm">Les paiements apparaîtront ici une fois enregistrés</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr 
                      key={payment.id}
                      className="border-t border-border hover:bg-accent/50 transition-all duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4 font-mono text-sm">
                        {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className="font-medium">Client</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          <span>Paiement</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          Complété
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold font-mono text-lg text-primary">
                        {payment.amount} FCFA
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
