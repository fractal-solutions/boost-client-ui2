import VendorPOS from './POS';
import VendorAnalytics from './Analytics';
import { OnlyBalance } from './Balance';

export default function VendorDashboard() {
  return (
    <div className="space-y-8">
      <VendorPOS />
      <VendorAnalytics />
    </div>
  );
}