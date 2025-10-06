export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crew</p>
              <p className="text-3xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="bi bi-people text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">+12%</span>
            <span className="text-gray-600 text-sm ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Applications
              </p>
              <p className="text-3xl font-bold text-gray-900">89</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="bi bi-file-earmark-text text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">+5%</span>
            <span className="text-gray-600 text-sm ml-2">from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-gray-900">23</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="bi bi-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-red-600 text-sm font-medium">+3</span>
            <span className="text-gray-600 text-sm ml-2">from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-3xl font-bold text-gray-900">4,532</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="bi bi-folder text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 text-sm font-medium">+18%</span>
            <span className="text-gray-600 text-sm ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h3>
              <a
                href="/admin/applications"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </a>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    JD
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    John Dela Cruz
                  </p>
                  <p className="text-xs text-gray-600">
                    Able Seaman Application
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    MS
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Maria Santos
                  </p>
                  <p className="text-xs text-gray-600">
                    Chief Engineer Application
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Approved
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    RG
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Roberto Garcia
                  </p>
                  <p className="text-xs text-gray-600">Captain Application</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                In Review
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/crew/add"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-center">
                  <i className="bi bi-person-plus text-2xl text-gray-400 group-hover:text-blue-500 mb-2"></i>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                    Add New Crew
                  </p>
                </div>
              </a>

              <a
                href="/admin/applications/review"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="text-center">
                  <i className="bi bi-clipboard-check text-2xl text-gray-400 group-hover:text-green-500 mb-2"></i>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">
                    Review Applications
                  </p>
                </div>
              </a>

              <a
                href="/admin/documents/upload"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
              >
                <div className="text-center">
                  <i className="bi bi-cloud-upload text-2xl text-gray-400 group-hover:text-purple-500 mb-2"></i>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
                    Upload Documents
                  </p>
                </div>
              </a>

              <a
                href="/admin/reports/generate"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors group"
              >
                <div className="text-center">
                  <i className="bi bi-graph-up text-2xl text-gray-400 group-hover:text-yellow-500 mb-2"></i>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-yellow-600">
                    Generate Report
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            System Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-shield-check text-blue-600 text-2xl"></i>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                System Status
              </h4>
              <p className="text-xs text-green-600 font-medium">
                All Systems Operational
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-database text-green-600 text-2xl"></i>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Database
              </h4>
              <p className="text-xs text-gray-600">Last backup: 2 hours ago</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-people text-purple-600 text-2xl"></i>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Active Users
              </h4>
              <p className="text-xs text-gray-600">142 users online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
