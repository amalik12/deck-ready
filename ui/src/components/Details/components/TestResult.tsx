import {TestResult as TestResultInterface, TestResultType} from '../../../api';

const TestResult: React.FC<{test: TestResultInterface}> = ({test}) => {
  let testIcon;
  switch (test.type) {
    case TestResultType.Info:
      break;
    case TestResultType.Verified:
      testIcon = '/verified.svg';
      break;
    case TestResultType.Playable:
      testIcon = '/playable.svg';
      break;
    case TestResultType.Unsupported:
      testIcon = '/unsupported.svg';
      break;
    default:
      break;
  }
  return (
    <div className="test-result">
      {testIcon && <img className="test-icon" src={testIcon} />}
      <span className="result-description">{test.description}</span>
    </div>
  );
};

export default TestResult;
