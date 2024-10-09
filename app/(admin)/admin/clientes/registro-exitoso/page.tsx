import { Suspense } from 'react';
import RegistroExitoso from './RegistroExitoso';

const RegistroExitosoPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RegistroExitoso />
  </Suspense>
);

export default RegistroExitosoPage;