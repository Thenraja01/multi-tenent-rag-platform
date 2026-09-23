import { redirect } from 'next/navigation';

export default function AdminRootRedirect() {
  redirect('/superadmin/dashboard');
}
