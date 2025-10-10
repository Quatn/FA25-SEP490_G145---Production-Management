"use client";

import { useState } from 'react';
import { Container, Stack, Form, Button, Modal } from 'react-bootstrap';

export default function PaperRollForm() {
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false);

    const [paperRoll, setPaperRoll] = useState({
        rollId: "",
        weight: "",
        importDate: "",
        paperType: "",
        factoryCode: "",
        paperWidth: "",
        basisWeight: "",
        materialNote: "",
        externalNote: "",
    });

    const handleReset = () => {
        setPaperRoll({
            rollId: "",
            weight: "",
            importDate: "",
            paperType: "",
            factoryCode: "",
            paperWidth: "",
            basisWeight: "",
            materialNote: "",
            externalNote: "",
        });
    }

    const handleChange = (field) => (e) => {
        setPaperRoll({ ...paperRoll, [field]: e.target.value });
    };

    const handleClose = () => setShow(false);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
        } else {
            setValidated(true);
            setShow(true);
        }
    };

    const labelStyle = { fontSize: '18px' };
    const inputStyle = {
        borderColor: '#000000',
        borderWidth: '2px',
        backgroundColor: '#ffffff',
    };

    return (
        <Container className="mt-5 p-4" style={{ background: '#D5E8D4'}}>
            <h4 className="text-center mb-4 fw-bold">NHẬP CUỘN GIẤY MỚI</h4>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                {/* Row 1 */}
                <Stack direction="horizontal" gap={4} className="mb-4 justify-content-center">
                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Mã Cuộn</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={paperRoll.rollId}
                            onChange={handleChange("rollId")}
                            style={{ ...inputStyle, width: '200px' }}
                        />
                        <Form.Control.Feedback type="invalid">Vui lòng nhập mã cuộn.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Trọng lượng</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            min={1}
                            value={paperRoll.weight}
                            onChange={handleChange("weight")}
                            style={{ ...inputStyle, width: '200px' }}
                        />
                        <Form.Control.Feedback type="invalid">Trọng lượng phải lớn hơn 0.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Lô / Ngày nhập</Form.Label>
                        <Form.Control
                            required
                            type="date"
                            value={paperRoll.importDate}
                            onChange={handleChange("importDate")}
                            style={{ ...inputStyle, width: '200px' }}
                        />
                        <Form.Control.Feedback type="invalid">Vui lòng chọn ngày nhập.</Form.Control.Feedback>
                    </Form.Group>
                </Stack>

                {/* Row 2 */}
                <Stack direction="horizontal" gap={4} className="mb-4 justify-content-center">
                    <Form.Group className='me-2'>
                        <Form.Label className="fw-bold" style={labelStyle}>Loại giấy</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={paperRoll.paperType}
                            onChange={handleChange("paperType")}
                            style={{ ...inputStyle, width: '100px' }}
                        />
                        <Form.Control.Feedback type="invalid">Không được để trống.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='me-5 ms-5'>
                        <Form.Label className="fw-bold" style={{ ...labelStyle, whiteSpace: 'nowrap' }}>Mã nhà giấy</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={paperRoll.factoryCode}
                            onChange={handleChange("factoryCode")}
                            style={{ ...inputStyle, width: '100px' }}
                        />
                        <Form.Control.Feedback type="invalid">Không được để trống.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Khổ giấy</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            min={1}
                            value={paperRoll.paperWidth}
                            onChange={handleChange("paperWidth")}
                            style={{ ...inputStyle, width: '150px', textAlign: 'center' }}
                        />
                        <Form.Control.Feedback type="invalid">Phải là số hợp lệ.</Form.Control.Feedback>
                    </Form.Group>

                    <h3 style={{ margin: '4vh 3vh 0vh 3vh' }}>X</h3>

                    <Form.Group>
                        <Form.Label className="fw-bold" style={{ ...labelStyle, whiteSpace: 'nowrap' }}>Định lượng</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            min={1}
                            value={paperRoll.basisWeight}
                            onChange={handleChange("basisWeight")}
                            style={{ ...inputStyle, width: '150px', textAlign: 'center' }}
                        />
                        <Form.Control.Feedback type="invalid">Phải là số hợp lệ.</Form.Control.Feedback>
                    </Form.Group>
                </Stack>

                {/* Row 3 */}
                <Stack direction="horizontal" gap={4} className="mb-4 justify-content-center">
                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Ghi chú nguyên liệu</Form.Label>
                        <Form.Control
                            type="text"
                            value={paperRoll.materialNote}
                            onChange={handleChange("materialNote")}
                            style={{ ...inputStyle, width: '320px' }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-bold" style={labelStyle}>Ghi chú ngoài</Form.Label>
                        <Form.Control
                            type="text"
                            value={paperRoll.externalNote}
                            onChange={handleChange("externalNote")}
                            style={{ ...inputStyle, width: '320px' }}
                        />
                    </Form.Group>
                </Stack>

                {/* Buttons */}
                <Stack direction='horizontal' gap={3} className='mb-4 justify-content-end'>
                    <Button variant="danger" size='lg' className="me-3 px-5" onClick={handleReset} type="button">Hủy</Button>
                    <Button variant="primary" size='lg' className="px-5" type="submit">Lưu</Button>
                </Stack>
            </Form>

            {/* Modal */}
            <Modal show={show} onHide={handleClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận nhập cuộn giấy mới</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#FFFF88' }}>
                    <Stack direction='vertical' gap={4}>
                        <h3>Bạn đang nhập vào kho giấy</h3>
                        <h3>
                            Cuộn giấy <span style={{ fontSize: '40px', color: 'red', marginLeft: '4vw' }}>
                                {`${paperRoll.paperType}/${paperRoll.factoryCode}/${paperRoll.paperWidth}/${paperRoll.basisWeight}/${paperRoll.rollId}`}
                            </span>
                        </h3>
                        <h3>
                            Trọng lượng <span style={{ fontSize: '40px', color: 'red', marginLeft: '4vw' }}>
                                {paperRoll.weight} kg
                            </span>
                        </h3>
                    </Stack>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose} size='lg' className='me-3 px-5'>Hủy</Button>
                    <Button variant="primary" onClick={handleClose} size='lg' className='me-3 px-4'>Xác nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
