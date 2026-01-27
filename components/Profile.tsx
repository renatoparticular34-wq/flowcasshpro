import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, User, Building2, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface ProfileProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const Profile: React.FC<ProfileProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Perfil da Empresa</h1>
        <p className="text-slate-500">Gerencie as informações da sua empresa.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Dados da Empresa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome da Empresa *
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={localSettings.companyName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="Digite o nome da sua empresa"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                E-mail de Contato
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={localSettings.email || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  value={localSettings.phone || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={localSettings.address || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="Rua, número, bairro, cidade - UF"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                CNPJ/CPF
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={localSettings.document || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, document: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information (Future Enhancement) */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-700">Informações Adicionais</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Em futuras versões, você poderá adicionar mais informações como:
          </p>
          <ul className="text-sm text-slate-500 space-y-1 ml-4">
            <li>• Redes sociais</li>
            <li>• Site da empresa</li>
            <li>• Logo da empresa</li>
            <li>• Configurações de notificação</li>
            <li>• Preferências de relatório</li>
          </ul>
        </section>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
          <User className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800">Importante</h4>
            <p className="text-sm text-amber-700">
              As informações da empresa aparecem no topo do menu lateral e nos relatórios.
              Mantenha os dados sempre atualizados para uma melhor identificação do seu negócio.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Save className="w-6 h-6" />
          Salvar Informações do Perfil
        </button>
      </form>
    </div>
  );
};

export default Profile;