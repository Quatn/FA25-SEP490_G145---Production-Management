"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useGetWareInfoQuery } from "@/service/api/wareInfoApiSlice";

export default function WareInfoTable() {
  // --- Fetch data ---
  const {
    data: wareInfoListQuery,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetWareInfoQuery({ page: 1, limit: 20 });

  const wareInfoList = wareInfoListQuery?.wareInfo || [];

  const [wareInfoListLocal, setWareInfoListLocal] = useState([]);

  useEffect(() => {
    if (wareInfoListQuery?.wareInfo) {
      setWareInfoListLocal(wareInfoListQuery.wareInfo);
    }
  }, [wareInfoListQuery]);

  // --- State cho filter + search ---
  const [searchCode, setSearchCode] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterSong, setFilterSong] = useState("");
  const [filterPaper, setFilterPaper] = useState("");
  const [filterProcessingType, setFilterProcessingType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Modal CRUD ---
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // --- Lọc dữ liệu ---
  const filteredList = useMemo(() => {
    return wareInfoListLocal.filter((item) => {
      const matchCode = item.product_code
        ?.toLowerCase()
        .includes(searchCode.toLowerCase());
      const matchCustomer = filterCustomer
        ? item.customer === filterCustomer
        : true;
      const matchSong = filterSong ? item.production_type === filterSong : true;
      const matchPaper = filterPaper ? item.paper_size === filterPaper : true;
      const matchProcessing = filterProcessingType
        ? item.processing_type === filterProcessingType
        : true;

      return (
        matchCode && matchCustomer && matchSong && matchPaper && matchProcessing
      );
    });
  }, [
    wareInfoListLocal, // 👈 thay ở đây
    searchCode,
    filterCustomer,
    filterSong,
    filterPaper,
    filterProcessingType,
  ]);

  // --- Các giá trị unique cho select ---
  const uniqueCustomers = [
    ...new Set(wareInfoListLocal.map((i) => i.customer)),
  ];
  const uniqueSongs = [
    ...new Set(wareInfoListLocal.map((i) => i.production_type)),
  ];
  const uniquePapers = [...new Set(wareInfoListLocal.map((i) => i.paper_size))];
  const uniqueProcessings = [
    ...new Set(wareInfoListLocal.map((i) => i.processing_type)),
  ];

  // --- Xử lý CRUD ---
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setIsEditMode(true);
    } else {
      setEditItem({
        id: null,
        product_code: "",
        customer: "",
        production_type: "",
        length: "",
        width_panel_flap: "",
        height: "",
        processing_type: "",
        quantity: "",
        processing_size: "",
        processing_cd: "",
        product_lid_flap: "",
        quantity_per_sheet: "",
        paper_size: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleDeleteConfirm = (item) => {
    setDeleteItem(item);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    if (!deleteItem) return;

    setWareInfoListLocal((prev) =>
      prev.filter((item) => item.id !== deleteItem.id)
    );

    console.log("Đã xóa:", deleteItem);
    setDeleteItem(null);
    setShowConfirm(false);
  };

  const handleSave = () => {
    if (!editItem) return;

    if (isEditMode) {
      // --- Cập nhật ---
      setWareInfoListLocal((prev) =>
        prev.map((item) => (item.id === editItem.id ? { ...editItem } : item))
      );
      console.log("Đã cập nhật:", editItem);
    } else {
      // --- Thêm mới ---
      const newItem = {
        ...editItem,
        id: Date.now(), // tạm gán ID duy nhất
      };
      setWareInfoListLocal((prev) => [...prev, newItem]);
      console.log("Đã thêm mới:", newItem);
    }

    setShowModal(false);
  };

  return (
    <Container fluid className="mt-3">
      <h3>Quản lý thông tin mã hàng</h3>

      {/* --- Filter + Search --- */}
      <Row className="my-3 g-2 align-items-end">
        <Col md={3}>
          <Form.Label>Mã hàng</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tìm theo mã hàng..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </Col>

        <Col md={2}>
          <Form.Label>Khách hàng</Form.Label>
          <Form.Select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="">Tất cả</option>
            {uniqueCustomers.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Label>Sóng</Form.Label>
          <Form.Select
            value={filterSong}
            onChange={(e) => setFilterSong(e.target.value)}
          >
            <option value="">Tất cả</option>
            {uniqueSongs.map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Label>Khổ giấy</Form.Label>
          <Form.Select
            value={filterPaper}
            onChange={(e) => setFilterPaper(e.target.value)}
          >
            <option value="">Tất cả</option>
            {uniquePapers.map((p, i) => (
              <option key={i}>{p}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Label>Kiểu sản phẩm gia công</Form.Label>
          <Form.Select
            value={filterProcessingType}
            onChange={(e) => setFilterProcessingType(e.target.value)}
          >
            <option value="">Tất cả</option>
            {uniqueProcessings.map((pt, i) => (
              <option key={i}>{pt}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md={1} className="text-end">
          <Button variant="success" onClick={() => handleOpenModal()}>
            + Thêm
          </Button>
        </Col>
      </Row>

      {/* --- Loading / Error --- */}
      {isFetchingList && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}
      {fetchError && (
        <Alert variant="danger">
          Lỗi khi tải dữ liệu:{" "}
          {fetchError?.data?.message || fetchError.toString()}
        </Alert>
      )}

      {/* --- Bảng dữ liệu --- */}
      {!isFetchingList && !fetchError && (
        <div
          style={{
            display: "flex",
            border: "1px solid #ccc",
            overflowX: "auto",
          }}
        >
          {/* Cột cố định bên trái */}
          <div style={{ flex: "0 0 auto" }}>
            <Table
              bordered
              striped
              hover
              size="sm"
              className="mb-0 text-center"
            >
              <thead className="fw-bold align-middle">
                <tr>
                  <th>Khách hàng</th>
                  <th>Mã hàng</th>
                  <th>Sóng</th>
                  <th>Dài/Khổ</th>
                  <th style={{ width: "70px", whiteSpace: "normal" }}>
                    Rộng/ C.Dài/
                    <br />
                    Cánh
                  </th>
                  <th>Cao</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <tr key={index} style={{ height: "39.4px" }}>
                      <td style={{ color: "red" }}>{item.customer}</td>
                      <td style={{ fontWeight: "bold", textAlign: "left" }}>
                        {item.product_code}
                      </td>
                      <td>{item.production_type}</td>
                      <td>{item.length}</td>
                      <td>{item.width_panel_flap}</td>
                      <td>{item?.height || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Cột cuộn ngang */}
          <div style={{ overflowX: "auto", flexGrow: 1 }}>
            <Table
              bordered
              striped
              hover
              size="sm"
              style={{ minWidth: "1500px" }}
              className="mb-0 text-center"
            >
              <thead
                className="fw-bold align-middle"
                style={{ height: "80.8px" }}
              >
                <tr>
                  <th style={{ color: "blue" }}>Kiểu sản phẩm</th>
                  <th style={{ color: "red" }}>Số SP</th>
                  <th>Khổ gia công</th>
                  <th>CD gia công</th>
                  <th>Nắp/Cánh SP</th>
                  <th style={{ color: "blue" }}>Số SP/Tấm</th>
                  <th style={{ color: "red" }}>Khổ giấy</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: "blue", fontWeight: "500" }}>
                        {item.processing_type}
                      </td>
                      <td style={{ color: "red", fontWeight: "500" }}>
                        {item.quantity ? Number(item.quantity).toFixed(1) : "-"}
                      </td>
                      <td>{item.processing_size}</td>
                      <td>{item.processing_cd}</td>
                      <td>{item?.product_lid_flap || "-"}</td>
                      <td style={{ color: "blue", fontWeight: "500" }}>
                        {item.quantity_per_sheet || "-"}
                      </td>
                      <td
                        style={{
                          color: "red",
                          fontWeight: "500",
                          textDecoration: "underline",
                        }}
                      >
                        {item.paper_size}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal(item)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteConfirm(item)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* --- Modal Create / Update --- */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Cập nhật mã hàng" : "Thêm mã hàng mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mã hàng</Form.Label>
                  <Form.Control
                    value={editItem?.product_code || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, product_code: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Khách hàng</Form.Label>
                  <Form.Select
                    value={editItem?.customer || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, customer: e.target.value })
                    }
                  >
                    <option value="">Chọn...</option>
                    {uniqueCustomers.map((c, i) => (
                      <option key={i}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Sóng</Form.Label>
                  <Form.Select
                    value={editItem?.production_type || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        production_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Chọn...</option>
                    {uniqueSongs.map((s, i) => (
                      <option key={i}>{s}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Dài/Khổ</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.length || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, length: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Rộng/C.Dài/Cánh</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.width_panel_flap || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        width_panel_flap: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cao</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.height || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, height: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Kiểu sản phẩm gia công</Form.Label>
                  <Form.Select
                    value={editItem?.processing_type || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        processing_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Chọn...</option>
                    {uniqueProcessings.map((pt, i) => (
                      <option key={i}>{pt}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Số SP</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={editItem?.quantity || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Khổ gia công</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.processing_size || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        processing_size: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>CD gia công</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.processing_cd || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        processing_cd: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nắp/Cánh SP</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.product_lid_flap || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        product_lid_flap: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Số SP/Tấm</Form.Label>
                  <Form.Control
                    type="number"
                    value={editItem?.quantity_per_sheet || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        quantity_per_sheet: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Khổ giấy</Form.Label>
                  <Form.Select
                    value={editItem?.paper_size || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        paper_size: e.target.value,
                      })
                    }
                  >
                    <option value="">Chọn...</option>
                    {uniquePapers.map((p, i) => (
                      <option key={i}>{p}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Confirm Delete --- */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa mã hàng{" "}
          <strong>{deleteItem?.product_code}</strong> không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
