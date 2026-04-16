import React, { createContext, useContext, useState, useEffect } from 'react';
import { getspecialties, getMedicalSystems } from '../services/api';
import type { Specialty, MedicalSystem } from '../services/api';

interface MetadataContextType {
  specialties: Specialty[];
  medicalSystems: MedicalSystem[];
}

const MetadataContext = createContext<MetadataContextType>({ specialties: [], medicalSystems: [] });

export const MetadataProvider = ({ children }: { children: React.ReactNode }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystem[]>([]);

  useEffect(() => {
    Promise.all([getspecialties(), getMedicalSystems()])
      .then(([specRes, sysRes]) => {
        setSpecialties(specRes.data);
        setMedicalSystems(sysRes.data);
      })
      .catch(() => { });
  }, []);

  return (
    <MetadataContext.Provider value={{ specialties, medicalSystems }}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => useContext(MetadataContext);
