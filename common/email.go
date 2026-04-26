package common

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/smtp"
	"slices"
	"strings"
	"time"
)

func generateMessageID() (string, error) {
	split := strings.Split(SMTPFrom, "@")
	if len(split) < 2 {
		return "", fmt.Errorf("invalid SMTP account")
	}
	domain := strings.Split(SMTPFrom, "@")[1]
	return fmt.Sprintf("<%d.%s@%s>", time.Now().UnixNano(), GetRandomString(12), domain), nil
}

func SendEmail(subject string, receiver string, content string) error {
	// 如果配置了 API 方式，走 HTTP API 发送（绕过 SMTP 端口限制）
	if EmailSendMethod == "api" {
		return sendEmailViaResendAPI(subject, receiver, content)
	}

	if SMTPFrom == "" { // for compatibility
		SMTPFrom = SMTPAccount
	}
	id, err2 := generateMessageID()
	if err2 != nil {
		return err2
	}
	if SMTPServer == "" && SMTPAccount == "" {
		return fmt.Errorf("SMTP 服务器未配置")
	}
	encodedSubject := fmt.Sprintf("=?UTF-8?B?%s?=", base64.StdEncoding.EncodeToString([]byte(subject)))
	mail := []byte(fmt.Sprintf("To: %s\r\n"+
		"From: %s <%s>\r\n"+
		"Subject: %s\r\n"+
		"Date: %s\r\n"+
		"Message-ID: %s\r\n"+ // 添加 Message-ID 头
		"Content-Type: text/html; charset=UTF-8\r\n\r\n%s\r\n",
		receiver, SystemName, SMTPFrom, encodedSubject, time.Now().Format(time.RFC1123Z), id, content))
	auth := smtp.PlainAuth("", SMTPAccount, SMTPToken, SMTPServer)
	addr := fmt.Sprintf("%s:%d", SMTPServer, SMTPPort)
	to := strings.Split(receiver, ";")
	var err error
	if SMTPPort == 465 || SMTPSSLEnabled {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         SMTPServer,
		}
		conn, err := tls.Dial("tcp", fmt.Sprintf("%s:%d", SMTPServer, SMTPPort), tlsConfig)
		if err != nil {
			return err
		}
		client, err := smtp.NewClient(conn, SMTPServer)
		if err != nil {
			return err
		}
		defer client.Close()
		if err = client.Auth(auth); err != nil {
			return err
		}
		if err = client.Mail(SMTPFrom); err != nil {
			return err
		}
		receiverEmails := strings.Split(receiver, ";")
		for _, receiver := range receiverEmails {
			if err = client.Rcpt(receiver); err != nil {
				return err
			}
		}
		w, err := client.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(mail)
		if err != nil {
			return err
		}
		err = w.Close()
		if err != nil {
			return err
		}
	} else if isOutlookServer(SMTPAccount) || slices.Contains(EmailLoginAuthServerList, SMTPServer) {
		auth = LoginAuth(SMTPAccount, SMTPToken)
		err = smtp.SendMail(addr, auth, SMTPFrom, to, mail)
	} else {
		err = smtp.SendMail(addr, auth, SMTPFrom, to, mail)
	}
	if err != nil {
		SysError(fmt.Sprintf("failed to send email to %s: %v", receiver, err))
	}
	return err
}

// sendEmailViaResendAPI 通过 Resend HTTP API 发送邮件
// 走 HTTPS 443 端口，不受 SMTP 端口封锁限制
func sendEmailViaResendAPI(subject, receiver, content string) error {
	if ResendAPIKey == "" {
		return fmt.Errorf("Resend API Key 未配置")
	}
	if SMTPFrom == "" {
		SMTPFrom = SMTPAccount
	}
	from := SMTPFrom
	if from == "" {
		from = "onboarding@resend.dev"
	}

	// 构造 Resend API 请求体
	reqData := map[string]interface{}{
		"from":    from,
		"to":      []string{receiver},
		"subject": subject,
		"html":    content,
	}
	reqBody, err := Marshal(reqData)
	if err != nil {
		return fmt.Errorf("构造 Resend API 请求体失败: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("创建 Resend API 请求失败: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("调用 Resend API 失败: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Resend API 返回错误 (HTTP %d): %s", resp.StatusCode, string(body))
	}

	return nil
}
