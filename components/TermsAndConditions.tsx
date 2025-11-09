import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md mt-6 text-sm">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">Membership Application Terms</h2>
      <div className="space-y-3 text-gray-700">
        <p><strong>1. Eligibility:</strong> Any natural person can become a member of the club. Members are obliged to support the interests of the club to the best of their ability and to refrain from anything that could harm the reputation or purpose of the club.</p>
        <p><strong>a.</strong> The club has only a yearly membership model. Each member needs to submit a separate form.</p>
        <p><strong>2. Admission:</strong> Admission is based on a written application and confirmation by the club. For minors, the consent of a legal guardian is required. If the application is rejected, the applicant (or the legal representative for minors) may appeal, to be decided by the honorary council.</p>
        <p><strong>3. Elections:</strong> Eligible for election are adult and fully contributing members. Exceptions apply to youth representatives as defined by the youth regulations. Temporary members cannot be elected to offices.</p>
        <div>
          <p><strong>4. Membership Ends Through:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Resignation</li>
            <li>Death</li>
            <li>Expulsion</li>
          </ul>
        </div>
        <p><strong>5. Resignation:</strong> Resignation is possible only at the end of a calendar year and must be declared in writing to the board at least three months in advance. In justified cases, the board may allow exceptions. For minors, the resignation must be signed by a legal guardian.</p>
        <div>
          <p><strong>6. Penalties:</strong> The board and department heads may impose penalties on members for:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Repeated deliberate violations of the statutes or the interests of the club</li>
            <li>Dishonorable conduct directly affecting club life and its reputation</li>
            <li>Non-payment of dues</li>
          </ul>
        </div>
        <div>
          <p><strong>7. Possible Measures:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Reprimand</li>
            <li>Exclusion from club activities</li>
            <li>Fine (for adults); fines over €100 require board approval</li>
            <li>Expulsion from the club</li>
          </ul>
        </div>
        <p><strong>8. Appeals:</strong> The member must be heard before any decision. Notification of expulsion must be sent by registered mail. Appeals must be submitted to the honorary council within two weeks. Their decision is final. Expelled members lose all rights to club assets.</p>
        <div>
          <h3 className="text-lg font-semibold mt-4 mb-2">Contributions</h3>
          <p>The members' assembly or AGM determines membership fees, admission fees, and other charges. Contributions are payable annually in advance through the current collection procedure (SEPA-Lastschriftmandat). Contributions are due regardless of participation. Members in arrears for over a year must pay all back dues by March 31st of the current year.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;