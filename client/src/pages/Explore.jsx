import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { getAllEqubs } from '../services/equbService';
import EqubCard from '../components/equb/EqubCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [equbs, setEqubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, pending

  useEffect(() => {
    const fetchEqubs = async () => {
      try {
        const data = await getAllEqubs();
        if (data.success) {
            setEqubs(data.equbs);
        }
      } catch (error) {
        console.error("Failed to fetch equbs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEqubs();
  }, []);

  const filteredEqubs = equbs.filter(equb => {
      const matchesSearch = equb.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || equb.status === filter;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-white mb-2">Explore Equbs</h1>
            <p className="text-slate-400">Discover and join verified savings groups.</p>
        </div>
        <Link to="/create-equb">
            <Button className="flex items-center gap-2">
                <Plus size={18} /> Create Equb
            </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Search equbs..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
         >
            <option value="all" className="bg-slate-900">All Status</option>
            <option value="active" className="bg-slate-900">Active</option>
            <option value="pending" className="bg-slate-900">Pending</option>
         </select>
      </div>

      {/* Grid */}
      {isLoading ? (
         <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
         </div>
      ) : filteredEqubs.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEqubs.map(equb => (
                <EqubCard key={equb._id} equb={equb} />
            ))}
         </div>
      ) : (
         <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No equbs found matching your criteria.</p>
         </div>
      )}
    </div>
  );
};

export default Explore;
