import { Button } from "antd";
function Navbar() {
  return (
    <nav className="navbar">
      <div className="flex items-center">
        <a
          href="/"
          className="text-xl font-bold text-blue-600 hover:text-blue-800"
        >
          Share Splitter
        </a>
      </div>
      <div className="flex space-x-6">
        <a
          href="/about"
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          About
        </a>
        <a
          href="/contact"
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          Contact
        </a>
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={addUsers}
        >
          {" "}
          Click to add Users
        </Button>
      </div>
    </nav>
  );
}

function addUsers() {
  // This function is a placeholder for adding users.
  // You can implement the logic to add users here.
  console.log("Add users functionality not implemented yet.");
}

export default Navbar;
