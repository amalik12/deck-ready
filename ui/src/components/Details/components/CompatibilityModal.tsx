import React from 'react';
import {
  CompatibilityCategory,
  GameBuild,
  GameCompatibility,
} from '../../../api';
import './CompatibliityModal.css';
import Modal from '../../Modal/Modal';
import TestResult from './TestResult';
const CompatibilityModal: React.FC<{
  compatibility: GameCompatibility;
  dismissFn: () => void;
  isOpen: boolean;
}> = ({compatibility, dismissFn, isOpen}) => {
  const categoryName = compatibility
    ? CompatibilityCategory[compatibility.category]
    : 'Unknown';
  return (
    <Modal isOpen={isOpen} dismiss={dismissFn}>
      <div className="modal-header">
        <span className="modal-title">Compatibility</span>
        <div className="compatibility-status">
          <img
            className="status-icon"
            src={`/${categoryName.toLowerCase()}.svg`}
          />
          {categoryName}
        </div>
      </div>
      <div className="modal-body">
        <div className="category-description">{compatibility?.description}</div>
        {compatibility && (
          <>
            {compatibility?.tests.map((test, index) => (
              <TestResult key={index} test={test} />
            ))}
            <div className="test-info">
              {compatibility.test_timestamp && (
                <div className="test-stat">
                  <span className="stat-name">Tested on: </span>
                  <span className="stat-value">
                    {new Intl.DateTimeFormat(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }).format(new Date(compatibility.test_timestamp * 1000))}
                  </span>
                </div>
              )}
              {compatibility.recommended_build && (
                <div className="test-stat">
                  <span className="stat-name">Tested version: </span>
                  <span className="stat-value">
                    {compatibility.recommended_build === GameBuild.Native
                      ? 'Native Linux'
                      : 'Proton'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CompatibilityModal;
