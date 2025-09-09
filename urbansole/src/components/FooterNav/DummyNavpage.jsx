import { useParams } from 'react-router';
function DummyFooterNavpage() {
  const { pageName } = useParams();

  const title = pageName.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="my-10 py-10 text-center text-2xl">
      <h1>{title}</h1>
      <p>This is the content for the {title} page.</p>
    </div>
  );
}
export default DummyFooterNavpage