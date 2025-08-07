import { useTheme } from "@/hooks/use-theme";

const DashboardPage = () => {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Student Dashboard</h1>
        </div>
    );
};

export default DashboardPage;

