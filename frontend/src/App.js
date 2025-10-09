// import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { CommandManager } from "./components/CommandManager";
import { ImportExportManagement } from "./components/ImportExportManagement";
import { Inventory } from "./components/Inventory";

function App() {
  return (
    <Router>
      {/* Thanh điều hướng */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/commands">🏭 Production Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/commands" end>
                Quản lý lệnh sản xuất
              </Nav.Link>
              <Nav.Link as={NavLink} to="/import-export">
                Quản lí đơn nhập/xuất
              </Nav.Link>
              <Nav.Link as={NavLink} to="/inventory">
                Quản lí kho bán thành phẩm
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/commands" replace />} />
          <Route path="/commands" element={<CommandManager />} />
          <Route path="/import-export" element={<ImportExportManagement />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="*" element={<h3>404 - Trang không tồn tại</h3>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
