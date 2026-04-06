import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, TrendingUp, MessageSquare, Moon, Trash2, Crown } from 'lucide-react';
import { api, AdminUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <div className="lottery-card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gold-900/40 border border-gold-700/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-gold-400" />
      </div>
      <div>
        <p className="text-gold-200/50 text-xs uppercase tracking-wide">{label}</p>
        <p className="font-cinzel text-2xl font-bold gold-text">{value}</p>
        {sub && <p className="text-gold-600/50 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.getAdminStats,
    enabled: !!user?.isAdmin,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: api.getAdminUsers,
    enabled: !!user?.isAdmin,
  });

  const toggleAdmin = useMutation({
    mutationFn: ({ id, isAdmin }: { id: number; isAdmin: boolean }) => api.toggleAdmin(id, isAdmin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (loading || !user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Shield className="w-8 h-8 text-gold-400" />
        <div>
          <h1 className="font-cinzel text-3xl font-bold gold-text">Panel de Administración</h1>
          <p className="text-gold-200/50 text-sm">Aurum Números · Sistema</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Usuarios" value={stats.totalUsers} />
          <StatCard icon={Crown} label="Suscripciones" value={stats.activeSubscriptions} sub="activas" />
          <StatCard icon={TrendingUp} label="Ingresos/Mes" value={`$${stats.monthlyRevenue}`} />
          <StatCard icon={Moon} label="Sueños" value={stats.totalDreams} sub="interpretados" />
        </div>
      )}

      {/* Users table */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gold-700/20 flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-400" />
          <h2 className="font-cinzel font-semibold text-gold-300">Usuarios Registrados</h2>
          <span className="ml-auto text-gold-600/50 text-sm">{usersData?.users.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gold-500/60 text-xs uppercase tracking-wider border-b border-gold-700/20">
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Registro</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-700/10">
              {usersData?.users.map((u: AdminUser) => (
                <tr key={u.id} className="hover:bg-gold-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gold-200 text-sm font-medium">{u.name || u.username}</p>
                      <p className="text-gold-600/50 text-xs">@{u.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gold-200/60 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border
                      ${u.subscription_status === 'active'
                        ? 'text-green-400 bg-green-900/20 border-green-700/30'
                        : 'text-gold-600/60 bg-dark-100/50 border-gold-700/20'
                      }`}>
                      {u.subscription_status === 'active' ? 'Premium' : 'Gratis'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border
                      ${u.is_admin
                        ? 'text-gold-400 bg-gold-900/30 border-gold-600/30'
                        : 'text-gold-600/40 bg-dark-100/50 border-gold-700/10'
                      }`}>
                      {u.is_admin ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gold-600/50 text-xs">
                    {new Date(u.created_at).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {u.id !== user.id && (
                        <>
                          <button
                            onClick={() => toggleAdmin.mutate({ id: u.id, isAdmin: !u.is_admin })}
                            className={`text-xs px-2 py-1 rounded border transition-all
                              ${u.is_admin
                                ? 'text-gold-600 border-gold-700/30 hover:border-gold-500/50'
                                : 'text-gold-400/70 border-gold-700/20 hover:border-gold-500/40'
                              }`}
                          >
                            {u.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al usuario ${u.username}?`)) {
                                deleteUser.mutate(u.id);
                              }
                            }}
                            className="text-red-500/60 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
