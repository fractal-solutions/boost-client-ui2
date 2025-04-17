import VendorPOS from './POS';
import VendorAnalytics from './Analytics';
import VendorBalance from './Balance';

export default function VendorDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        
        
      </div>
      <VendorPOS />
      <VendorAnalytics />
    </div>
  );
}