import Empty from './components/empty';
import AppList from './components/appList';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/Loading';
import { useAppStore } from '@/store/app';

export default function Home() {
  const { appList, setAppList, updateAppMetrics } = useAppStore();

  const { isFetching } = useQuery(['appListQuery'], setAppList);

  useQuery(
    ['updateAppMetrics', appList.length],
    () => appList.map((app) => updateAppMetrics(app.name)),
    {
      refetchInterval: 3000
    }
  );

  return (
    <>
      {appList.length === 0 && !isFetching ? <Empty /> : <AppList apps={appList} />}
      {isFetching && <Loading />}
    </>
  );
}
