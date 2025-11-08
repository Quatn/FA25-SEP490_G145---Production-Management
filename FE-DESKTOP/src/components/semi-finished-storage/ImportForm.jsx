"use client";

import { useState } from 'react';
import { Container, Stack, Form, Button, Modal, Row, Col } from 'react-bootstrap';

export default function ImportForm() {
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false);

    const [order, setOrder] = useState({
        orderId: '2129/08',
        quantity: '',
    });

    const handleChange = (field) => (e) => {
        setOrder({ ...order, [field]: e.target.value });
    }

    const handleClose = () => setShow(false);

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();

        if (form.checkValidity() == false) {
            e.stopPropagation();
            setValidated(true);
        } else {
            setValidated(true);
            setShow(true);
        }
    }

    return (
        <Container className='mt-5 p-4' style={{ background: '#D5E8D4' }}>
            <h4 className='text-center mb-4 fw-bold'> NHẬP KHO THÀNH PHẨM </h4>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>


                <Row className='justify-content-md-center'>
                    <Col md='auto' className='fw-bold me-5' style={{ fontSize: '30px' }}>
                        Lệnh
                    </Col>
                    <Col md='auto' className='fw-bold ms-5' style={{ fontSize: '30px' }}>
                        {order.orderId}
                    </Col>
                </Row>

                <Form.Group as={Row} className='justify-content-md-center mt-5 mb-5 position-relative'>
                    <Form.Label column className='fw-bold me-5' md='auto' style={{ fontSize: '30px' }}>
                        Số lượng
                    </Form.Label>

                    <Form.Control
                        required
                        type='number'
                        min={1}
                        value={order.quantity}
                        onChange={handleChange("quantity")}
                        style={{
                            fontSize: '30px',
                            width: '140px',
                            border: 'solid 2px #000000',
                        }}
                        md='auto'>

                    </Form.Control>

                    <Form.Control.Feedback className='mt-3' type='invalid' tooltip='true' style={{ width: '300px', fontSize: '25px' }}>
                        Số lượng phải lớn hơn 0
                    </Form.Control.Feedback>
                </Form.Group>

                <Row className='justify-content-end'>
                    <Col md='auto'>
                        <Button variant="danger" size='lg' className="me-3 px-5" type="button">Hủy</Button>
                    </Col>
                    <Col md='auto'>
                        <Button variant="primary" size='lg' className="px-5" type="submit">Lưu</Button>
                    </Col>
                </Row>

            </Form>

            {/* Modal */}
            <Modal show={show} onHide={handleClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận nhập kho thành phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#FFFF88' }}>
                    <Col>
                        <Row className='justify-content-center mb-3'>
                            <Col md='auto'>
                                <h3>Bạn đang nhập vào kho thành phẩm</h3>
                            </Col>
                        </Row>
                        <Row className='justify-content-center'>
                            <Col md='auto' className='me-5'>
                                <span className='fw-bold' style={{ fontSize: '30px' }}>
                                    Lệnh
                                </span>
                                <span style={{ fontWeight: 'bold', fontSize: '40px', color: 'red', marginLeft: '2vw' }}>
                                    {order.orderId}
                                </span>
                            </Col>
                            <Col md='auto' className='ms-5'>
                                <span className='fw-bold' style={{ fontSize: '30px' }}>
                                    Số lượng
                                </span>
                                <span style={{ fontWeight: 'bold', fontSize: '40px', color: 'red', marginLeft: '2vw' }}>
                                    {order.quantity}
                                </span>
                            </Col>
                        </Row>
                    </Col>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose} size='lg' className='me-3 px-5'>Hủy</Button>
                    <Button variant="primary" onClick={handleClose} size='lg' className='me-3 px-4'>Xác nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

}