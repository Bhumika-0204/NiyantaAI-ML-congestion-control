import React, { useState } from 'react';
import { Shield, ShieldAlert, Sliders, Activity, Server, Lock, Globe, Power, UserX, Network, ServerCog } from 'lucide-react';

export default function Policies() {
  const [aclForm, setAclForm] = useState({
    blockAllAttacks: true,
    blockUnauthorized: true,
    filterArp: false,
    trafficPortBased: true,
    trafficDNS: true,
    trafficDHCP: false,
  });

  const [macBinding, setMacBinding] = useState([
    { ip: '192.168.1.100', mac: '00:1A:2B:3C:4D:5E' },
    { ip: '192.168.1.101', mac: 'FE:DC:BA:98:76:54' }
  ]);
  const [newMac, setNewMac] = useState({ ip: '', mac: '' });

  const [rateLimit, setRateLimit] = useState({
    packetRate: 5000,
    cpuThreshold: 85,
    reducePayload: true,
  });

  const [securityPolicies, setSecurityPolicies] = useState({
    portSecurityEnabled: true,
    vpnAccessEnabled: false,
  });

  const toggleAcl = (field) => setAclForm({ ...aclForm, [field]: !aclForm[field] });
  const toggleRateLimit = (field) => setRateLimit({ ...rateLimit, [field]: !rateLimit[field] });
  const toggleSecPol = (field) => setSecurityPolicies({ ...securityPolicies, [field]: !securityPolicies[field] });

  const handleAddMac = (e) => {
    e.preventDefault();
    if (newMac.ip && newMac.mac) {
      setMacBinding([...macBinding, newMac]);
      setNewMac({ ip: '', mac: '' });
    }
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
             <Sliders className="text-blue-400" size={28} />
          </div>
          Network Policies & Controls
        </h2>
        <p className="text-gray-400 mt-2 pl-14">Configure Access Control Lists, Rate Limits, and Advanced Network Security Rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: ACL */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-red-400" /> ACL Rules
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Global Threat & Users */}
              <div className="space-y-4">
                <h4 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Global Threats & Users</h4>
                <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                  <div className="flex items-center gap-3">
                    <Shield className={aclForm.blockAllAttacks ? 'text-emerald-400' : 'text-gray-500'} />
                    <div>
                      <div className="font-semibold">Block All Known Attacks</div>
                      <div className="text-xs text-gray-400">Intrusion prevention against DDoS, brute force</div>
                    </div>
                  </div>
                  <input type="checkbox" className="sr-only" checked={aclForm.blockAllAttacks} onChange={() => toggleAcl('blockAllAttacks')} />
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${aclForm.blockAllAttacks ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${aclForm.blockAllAttacks ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                  <div className="flex items-center gap-3">
                    <UserX className={aclForm.blockUnauthorized ? 'text-red-400' : 'text-gray-500'} />
                    <div>
                      <div className="font-semibold">Drop Unauthorized Users</div>
                      <div className="text-xs text-gray-400">Isolate unknown MACs / Guest clients</div>
                    </div>
                  </div>
                  <input type="checkbox" className="sr-only" checked={aclForm.blockUnauthorized} onChange={() => toggleAcl('blockUnauthorized')} />
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${aclForm.blockUnauthorized ? 'bg-red-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${aclForm.blockUnauthorized ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                  <div className="flex items-center gap-3">
                    <Network className={aclForm.filterArp ? 'text-blue-400' : 'text-gray-500'} />
                    <div>
                      <div className="font-semibold">Filter Unwanted ARP</div>
                      <div className="text-xs text-gray-400">Prevent localized ARP spoofing/poisoning</div>
                    </div>
                  </div>
                  <input type="checkbox" className="sr-only" checked={aclForm.filterArp} onChange={() => toggleAcl('filterArp')} />
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${aclForm.filterArp ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${aclForm.filterArp ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>

              {/* Traffic Type Filters */}
              <div className="space-y-4">
                <h4 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Traffic Type Filtering</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => toggleAcl('trafficPortBased')}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${aclForm.trafficPortBased ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                  >
                    Port Based Inspection
                  </button>
                  <button 
                    onClick={() => toggleAcl('trafficDNS')}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${aclForm.trafficDNS ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                  >
                    DNS Requests
                  </button>
                  <button 
                    onClick={() => toggleAcl('trafficDHCP')}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${aclForm.trafficDHCP ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                  >
                    DHCP Client Packets
                  </button>
                </div>
              </div>

              {/* MAC Binding */}
              <div className="space-y-4">
                <h4 className="text-sm text-gray-400 font-semibold uppercase tracking-wider">IP-MAC Binding List</h4>
                <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 bg-gray-900 border-b border-gray-800">
                      <tr><th className="px-4 py-2">IP Address</th><th className="px-4 py-2">MAC Address</th></tr>
                    </thead>
                    <tbody className="text-gray-300 font-mono">
                      {macBinding.map((bind, idx) => (
                        <tr key={idx} className="border-b border-gray-800/50">
                          <td className="px-4 py-2">{bind.ip}</td>
                          <td className="px-4 py-2 text-gray-500">{bind.mac}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <form onSubmit={handleAddMac} className="flex gap-2">
                  <input type="text" placeholder="IP (e.g. 10.0.0.5)" value={newMac.ip} onChange={(e) => setNewMac({...newMac, ip: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <input type="text" placeholder="MAC Address" value={newMac.mac} onChange={(e) => setNewMac({...newMac, mac: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Add</button>
                </form>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          
          {/* Section 2: Rate Limiting & CPU Rules */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-orange-400" /> Rate Limiting & Flow Control
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold">Global Packet Rate Limit</label>
                  <span className="text-orange-400 font-mono">{rateLimit.packetRate} p/s</span>
                </div>
                <input 
                  type="range" 
                  min="500" max="20000" step="500" 
                  value={rateLimit.packetRate} 
                  onChange={(e) => setRateLimit({...rateLimit, packetRate: e.target.value})}
                  className="w-full accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" 
                />
                <p className="text-xs text-gray-500 mt-2">Maximum allowed packets passing through the virtual gateway interface.</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold">CPU Rate Threshold</label>
                  <span className="text-orange-400 font-mono">{rateLimit.cpuThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="30" max="95" step="5" 
                  value={rateLimit.cpuThreshold} 
                  onChange={(e) => setRateLimit({...rateLimit, cpuThreshold: e.target.value})}
                  className="w-full accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" 
                />
                <p className="text-xs text-gray-500 mt-2">When system CPU load hits this threshold, strict bandwidth shaping will auto-apply.</p>
              </div>

              <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                <div className="flex items-center gap-3">
                  <ServerCog className={rateLimit.reducePayload ? 'text-pink-400' : 'text-gray-500'} />
                  <div>
                    <div className="font-semibold">Reduce Data Payload (Strict Size)</div>
                    <div className="text-xs text-gray-400">Truncate or fragment large packets automatically</div>
                  </div>
                </div>
                <input type="checkbox" className="sr-only" checked={rateLimit.reducePayload} onChange={() => toggleRateLimit('reducePayload')} />
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${rateLimit.reducePayload ? 'bg-pink-500' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${rateLimit.reducePayload ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>

            </div>
          </div>

          {/* Section 3: Advanced Security Policies (VPN & Port Sec) */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lock className="text-purple-400" /> Security Policies
              </h3>
            </div>
            <div className="p-6 space-y-4">
              
              <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                <div className="flex items-center gap-3">
                  <Server className={securityPolicies.portSecurityEnabled ? 'text-yellow-400' : 'text-gray-500'} />
                  <div>
                    <div className="font-semibold">Port Security Limits</div>
                    <div className="text-xs text-gray-400">Restrict ingress ports based on learned MACs</div>
                  </div>
                </div>
                <input type="checkbox" className="sr-only" checked={securityPolicies.portSecurityEnabled} onChange={() => toggleSecPol('portSecurityEnabled')} />
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${securityPolicies.portSecurityEnabled ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${securityPolicies.portSecurityEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                <div className="flex items-center gap-3">
                  <Globe className={securityPolicies.vpnAccessEnabled ? 'text-emerald-400' : 'text-gray-500'} />
                  <div>
                    <div className="font-semibold">Require Secured VPN</div>
                    <div className="text-xs text-gray-400">Force external connections through IPsec/OpenVPN endpoints</div>
                  </div>
                </div>
                <input type="checkbox" className="sr-only" checked={securityPolicies.vpnAccessEnabled} onChange={() => toggleSecPol('vpnAccessEnabled')} />
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${securityPolicies.vpnAccessEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${securityPolicies.vpnAccessEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
