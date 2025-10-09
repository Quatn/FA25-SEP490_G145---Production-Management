import { useState, useEffect } from "react";
import { Container, Row, Col, InputGroup, Form, Table } from "react-bootstrap";
import {
  importForm,
  exportForm,
  inventory,
} from "../data/mockData-inventory-management";
import { commands } from "../data/mockData-commands";
export const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [commandData, setCommandData] = useState(commands);
  const [importData, setImportData] = useState(importForm);
  const [exportData, setExportData] = useState(exportForm);
  const [inventories, setInventories] = useState(inventory);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let result = [...inventories];

    // Lọc theo mã lệnh SX
    if (searchTerm) {
      result = result.filter((item) =>
        item.productionOrderCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    setFilteredData(result);
  }, [searchTerm, inventories]);

  const getCommandDetails = (id) => {
    return commandData.find((item) => item.productionOrderCode === id);
  };

  const getTotalImport = (id) => {
    return (
      importData?.find((item) => item.productionOrderCode === id)
        ?.totalImportQuantity || 0
    );
  };

  const getTotalExport = (id) => {
    return (
      exportData?.find((item) => item.productionOrderCode === id)
        ?.totalExportQuantity || 0
    );
  };

  const getActualQuantity = (id) => {
    const importQuantity =
      importData?.find((item) => item.productionOrderCode === id)
        ?.totalImportQuantity || 0;
    const exportQuantity =
      exportData?.find((item) => item.productionOrderCode === id)
        ?.totalExportQuantity || 0;
    return importQuantity - exportQuantity;
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold">Quản lý kho bán thành phẩm</h2>

      {/* Bộ lọc */}
      <Row className="mb-4 align-items-end">
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo lệnh SX"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>
      <Table bordered hover responsive style={{ fontSize: "14px" }}>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th className="text-center">Lệnh SX</th>
            <th className="text-center">Mã Hàng</th>
            <th className="text-center">Sóng</th>
            <th className="text-center">Dài/Khổ</th>
            <th className="text-center">Rộng/CD</th>
            <th className="text-center">Cao</th>
            <th className="text-center">Tồn Kho</th>
            <th className="text-center">SL Xuất</th>
            <th className="text-center">SL Nhập</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={`inventory-${index}`}>
              <td className="text-center fw-semibold">
                {item.productionOrderCode}
              </td>
              <td>{item.wareCode}</td>
              <td>{getCommandDetails(item.productionOrderCode)?.waveType}</td>
              <td>{getCommandDetails(item.productionOrderCode)?.length}</td>
              <td>{getCommandDetails(item.productionOrderCode)?.width}</td>
              <td>{getCommandDetails(item.productionOrderCode)?.height}</td>
              <td>
                {getActualQuantity(item.productionOrderCode).toLocaleString()}
              </td>
              <td>
                {getTotalExport(item.productionOrderCode).toLocaleString()}
              </td>
              <td>
                {getTotalImport(item.productionOrderCode).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
