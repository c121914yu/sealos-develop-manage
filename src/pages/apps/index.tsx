import Empty from './components/empty';
import AppList from './components/appList';
import { useQuery } from '@tanstack/react-query';
// import Loading from '@/components/Loading';
import { useAppStore } from '@/store/app';
import { useLoading } from '@/hooks/useLoading';

export default function Home() {
  const { appList, setAppList, updateAppMetrics } = useAppStore();
  const { Loading } = useLoading();
  const { isLoading } = useQuery(['appListQuery'], setAppList);

  useQuery(
    ['updateAppMetrics', appList.length],
    () => appList.map((app) => updateAppMetrics(app.name)),
    {
      refetchInterval: 3000
    }
  );

  return (
    <>
      {appList.length === 0 && !isLoading ? <Empty /> : <AppList apps={appList} />}
      <Loading loading={isLoading} />
    </>
  );
}