import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getspecialties, getMedicalSystems } from '../services/api';
import type { Specialty, MedicalSystem } from '../services/api';
import { useAuth } from './AuthContext';

export type SearchSuggestion = { label: string; type: 'specialty' | 'medicalSystem'; id: string };

interface MetadataContextType {
  specialties: Specialty[];
  medicalSystems: MedicalSystem[];
  randomSuggestions: SearchSuggestion[];
}

const MetadataContext = createContext<MetadataContextType>({ specialties: [], medicalSystems: [], randomSuggestions: [] });

export const MetadataProvider = ({ children }: { children: React.ReactNode }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([]);
  const [randomSuggestions, setRandomSuggestions] = useState<SearchSuggestion[]>([]);
  const picked = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.accessToken) return;
    Promise.all([getspecialties(), getMedicalSystems()])
      .then(([specRes, sysRes]) => {
        setSpecialties(specRes.data);
        setMedicalSystems(sysRes.data);
        if (!picked.current && specRes.data.length && sysRes.data.length) {
          picked.current = true;
          const randSpec = specRes.data[Math.floor(Math.random() * specRes.data.length)];
          const randSys = sysRes.data[Math.floor(Math.random() * sysRes.data.length)];
          setRandomSuggestions([
            { label: randSpec.name, type: 'specialty', id: randSpec.id },
            { label: randSys.name, type: 'medicalSystem', id: randSys.id },
          ]);
        }
      })
      .catch(() => { });
  }, [user?.accessToken]);

  return (
    <MetadataContext.Provider value={{ specialties, medicalSystems, randomSuggestions }}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => useContext(MetadataContext);
