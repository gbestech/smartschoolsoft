import React from 'react';
import AdminNegotiationManagement from './AdminNegotiationManagement ';
import PriceNegotiationModal from './PrinceNegotiation';
import RefundRequestModal from './RefundRequestList';

const ViewStaff = () => {
  return (
    <div>
      <AdminNegotiationManagement />
      <PriceNegotiationModal />
      <RefundRequestModal />
    </div>
  );
}

export default ViewStaff;
